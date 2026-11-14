
import { createRequire } from "node:module";
const require = createRequire("D:/Dh house/x.mjs");
const ROOT = "D:/Dsh house/projects/mock-server/cilent";
const API = "http://127.0.0.1:8080/api/v1";

const storage = new Map();
const toasts = [], nav = [];
let pageConfig = null, appInstance = null;

function setByPath(obj, path, value) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}
const toQuery = (p) => {
  if (!p) return "";
  const parts = [];
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== null && v !== "") parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
  return parts.length ? "?" + parts.join("&") : "";
};

globalThis.wx = {
  login(o) { setTimeout(() => o.success && o.success({ code: "sim" }), 5); },
  request(o) {
    const method = (o.method || "GET").toUpperCase();
    const url = o.url + (method === "GET" ? toQuery(o.data) : "");
    const headers = Object.assign({}, o.header || {});
    const body = method !== "GET" && o.data !== undefined ? JSON.stringify(o.data) : undefined;
    if (o.enableChunked) {
      const ctrl = new AbortController();
      let chunkCb = null;
      const task = { onChunkReceived(cb) { chunkCb = cb; }, abort() { ctrl.abort(); } };
      (async () => {
        try {
          const res = await fetch(url, { method, headers, body, signal: ctrl.signal });
          const ctype = res.headers.get("content-type") || "";
          if (!res.ok || !ctype.includes("text/event-stream")) {
            const text = await res.text();
            o.success && o.success({ statusCode: res.status, data: text, header: {} });
            return;
          }
          const reader = res.body.getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (chunkCb) chunkCb({ data: new Uint8Array(value).slice().buffer });
          }
          o.success && o.success({ statusCode: 200, data: new ArrayBuffer(0), header: {} });
        } catch (e) {
          if (!ctrl.signal.aborted && o.fail) o.fail({ errMsg: String(e) });
        }
      })();
      return task;
    }
    fetch(url, { method, headers, body })
      .then(async (res) => {
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = text; }
        o.success && o.success({ statusCode: res.status, data, header: {} });
      })
      .catch((err) => o.fail && o.fail({ errMsg: String(err) }));
    return { abort() {} };
  },
  getStorageSync(k) { return storage.has(k) ? storage.get(k) : ""; },
  setStorageSync(k, v) { storage.set(k, v); },
  removeStorageSync(k) { storage.delete(k); },
  clearStorageSync() { storage.clear(); },
  showToast(o) { toasts.push(o && o.title); },
  showLoading() {}, hideLoading() {},
  showModal(o) { o && o.success && o.success({ confirm: true }); },
  navigateTo(o) { nav.push(o.url); }, redirectTo(o) { nav.push(o.url); },
  switchTab(o) { nav.push(o.url); }, navigateBack() {}, reLaunch(o) { nav.push(o.url); },
  stopPullDownRefresh() {}, pageScrollTo() {}, setNavigationBarTitle() {},
  getWindowInfo() { return { statusBarHeight: 20, windowWidth: 375, windowHeight: 700 }; },
  getSystemInfoSync() { return { statusBarHeight: 20, windowWidth: 375, windowHeight: 700 }; },
  createSelectorQuery() { const q = { select() { return q; }, selectViewport() { return q; }, boundingClientRect(cb) { cb && cb({ height: 600 }); return q; }, scrollOffset() { return q; }, exec() {} }; return q; },
  nextTick(cb) { setTimeout(cb, 0); }, setClipboardData(o) { o.success && o.success(); },
  previewImage() {}, chooseMedia(o) { o.success && o.success({ tempFiles: [] }); }, vibrateShort() {}
};
globalThis.getCurrentPages = () => [{ route: "pages/ai/ai" }];
globalThis.App = (c) => { appInstance = c; };
globalThis.Page = (c) => { pageConfig = c; };
globalThis.getApp = () => appInstance;

const warns = [];
const ow = console.warn, oe = console.error;
console.warn = (...a) => warns.push(a.join(" "));
console.error = (...a) => warns.push("ERROR " + a.join(" "));

require(ROOT + "/app.js");
appInstance.globalData = JSON.parse(JSON.stringify(appInstance.globalData));
appInstance.onLaunch();
await appInstance.ready;
await new Promise(r => setTimeout(r, 300));

// 新版前端不再静默登录：先登录演示账号
const authApi = require(ROOT + "/api/auth.js");
const loginResp = await authApi.passwordLogin("13843216621", "123456");
appInstance.setUser(loginResp.user);

function loadPage(rel) {
  pageConfig = null;
  const full = require.resolve(ROOT + "/" + rel);
  delete require.cache[full];
  require(full);
  const inst = Object.create(pageConfig);
  inst.data = JSON.parse(JSON.stringify(pageConfig.data || {}));
  inst.setData = function (patch) { for (const [k, v] of Object.entries(patch || {})) setByPath(this.data, k, v); };
  return inst;
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const out = [];
const check = (name, ok, note) => { out.push({ name, ok, note }); console.log((ok ? "✅" : "❌") + " " + name + (note ? "  " + note : "")); };

// ---------- 1. 资讯点赞 ----------
{
  const p = loadPage("pages/article/detail.js");
  p.onLoad({ id: "a1001" });
  await wait(700);
  const before = p.data.likes;
  p.onLike();
  await wait(600);
  const after = p.data.likes;
  const liked = p.data.liked;
  check("资讯点赞（页面代码）", after === before + 1 && liked === true, "likes " + before + "→" + after + " liked=" + liked);
  p.onLike();
  await wait(600);
  check("取消点赞", p.data.likes === before && p.data.liked === false, "likes=" + p.data.likes + " liked=" + p.data.liked);
}

// ---------- 2. 在线申报（页面提交） ----------
{
  const p = loadPage("pages/gov/apply.js");
  p.onLoad({ code: "YB001" });
  await wait(800);
  const fields = p.data.fields.map(f => Object.assign({}, f));
  fields.forEach(f => { if (f.required) f.value = f.type === "idcard" ? "220221199001010026" : (f.options && f.options.length ? f.options[0] : "测试值"); });
  p.setData({ fields, agree: true });
  const navBefore = nav.length;
  p.submit();
  await wait(1600);
  const created = nav.slice(navBefore).find(u => u.indexOf("/pages/gov/apply-detail?id=") === 0);
  check("在线申报（页面提交）", !!created && !p.data.formError, created ? created : ("formError=" + p.data.formError));
  if (created) {
    const id = created.split("id=")[1].split("&")[0];
    const detail = await fetch(API + "/gov/applies/" + id, { headers: { Authorization: "Bearer " + storage.get("xct_token") } }).then(r => r.json());
    check("申报结果可回查", detail.code === 0 && detail.data.status === "SUBMITTED", detail.data && detail.data.applyNo + " " + (detail.data && detail.data.statusLabel));
  }
}

// ---------- 3. AI 流式（页面代码 + 客户端 SSE 解析） ----------
{
  const p = loadPage("pages/ai/ai.js");
  p.onLoad({});
  await wait(700);
  check("AI 推荐问加载", p.data.suggestions.length === 4, "suggestions=" + p.data.suggestions.length);

  p.sendQuestion("今年医保怎么缴");
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline && p.data.streaming) await wait(150);
  await wait(500);

  const msgs = p.data.messages;
  const assistant = msgs[msgs.length - 1];
  const text = assistant && assistant.content ? assistant.content : "";
  check("AI 流式回答（客户端解析）", text.includes("380") && text.length > 80, "长度=" + text.length + " 首字=" + text.slice(0, 18));
  check("AI 引用", assistant && assistant.refs && assistant.refs.length === 2, "refs=" + (assistant && assistant.refs && assistant.refs.length));
  check("AI 追问", assistant && assistant.followUps && assistant.followUps.length === 2, JSON.stringify(assistant && assistant.followUps));
  check("AI messageId 可用", assistant && assistant.serverMessageId && assistant.serverMessageId !== "pending", "id=" + (assistant && assistant.serverMessageId));
  check("流式状态复位", p.data.streaming === false, "streaming=" + p.data.streaming);

  p.onFeedback({ currentTarget: { dataset: { index: msgs.length - 1, type: "up" } } });
  await wait(600);
  const fb = p.data.messages[msgs.length - 1].feedback;
  check("AI 反馈（页面代码）", fb === "up", "feedback=" + fb + " toast=" + toasts.slice(-1));

  if (assistant && assistant.refs && assistant.refs[0]) {
    const n0 = nav.length;
    p.onRefTap({ currentTarget: { dataset: { route: assistant.refs[0].route } } });
    check("引用跳转", nav.length === n0 + 1, nav[nav.length - 1]);
  }

  const convId = p.conversationId;
  const res = await fetch(API + "/ai/conversations/" + convId + "/messages", { headers: { Authorization: "Bearer " + storage.get("xct_token") } }).then(r => r.json());
  check("会话已落库", res.code === 0 && res.data.list.length >= 2, "消息 " + (res.data && res.data.list.length) + " 条");
}

// ---------- 4. AI 历史页 ----------
{
  const p = loadPage("pages/ai/history.js");
  if (p.onLoad) p.onLoad({}); else if (p.onShow) p.onShow();
  await wait(600);
  const sessions = p.data.sessions || [];
  check("AI 历史页", sessions.length >= 1, "sessions=" + sessions.length);
}


// ---------- 5. 诉求提交（页面代码） ----------
{
  const p = loadPage("pages/request/create.js");
  p.onLoad({ type: "appeal" });
  await wait(200);
  p.setData({ title: "调试：三组路灯不亮", content: "三组东侧两盏路灯坏了快一周，晚上老人出行不安全，希望尽快维修。", location: "三组 26 号东侧" });
  const navBefore = nav.length;
  p.onSubmit();
  await wait(1200);
  const created = nav.slice(navBefore).find(u => u.indexOf("/pages/request/detail?id=") === 0);
  check("诉求提交（页面代码）", !!created && !p.data.error, created || ("error=" + p.data.error));
  if (created) {
    const id = created.split("id=")[1].split("&")[0];
    const detail = await fetch(API + "/requests/" + id, { headers: { Authorization: "Bearer " + storage.get("xct_token") } }).then(r => r.json());
    check("诉求可回查", detail.code === 0 && detail.data.status === "PENDING", detail.data && detail.data.requestNo + " " + (detail.data && detail.data.statusLabel));
  }
}

// ---------- 6. 修改昵称（页面代码） ----------
{
  const p = loadPage("pages/profile/edit.js");
  p.onLoad();
  await wait(700);
  p.onNicknameInput({ detail: { value: "王秀兰" } });
  const navBefore = nav.length;
  p.onSave();
  await wait(900);
  const me = await fetch(API + "/users/me", { headers: { Authorization: "Bearer " + storage.get("xct_token") } }).then(r => r.json());
  check("修改昵称（页面代码）", me.code === 0 && me.data.nickname === "王秀兰" && !p.data.error, "nickname=" + (me.data && me.data.nickname));
}

console.warn = ow; console.error = oe;
const fails = out.filter(x => !x.ok);
const realWarns = warns.filter(w => !/chooseMedia|previewImage|secure/.test(w));
console.log("\n交互用例 " + (out.length - fails.length) + "/" + out.length + " 通过" + (realWarns.length ? "；warn=" + realWarns.slice(0, 2).join(" | ") : ""));
