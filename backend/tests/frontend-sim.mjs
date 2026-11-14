
import { createRequire } from "node:module";
const require = createRequire("D:/Dsh house/projects/mock-server/tests-sim.mjs");
const ROOT = "D:/Dsh house/projects/mock-server/cilent";

// ---------- 极简 wx 运行时 ----------
const storage = new Map();
const logs = [];
const nav = [];
let pageConfig = null;
let appInstance = null;

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

function toQuery(params) {
  if (!params) return "";
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
  }
  return parts.length ? "?" + parts.join("&") : "";
}

globalThis.wx = {
  login(o) { setTimeout(() => o.success && o.success({ code: "sim-code" }), 5); },
  request(o) {
    const method = (o.method || "GET").toUpperCase();
    const url = o.url + (method === "GET" ? toQuery(o.data) : "");
    const headers = Object.assign({}, o.header || {});
    let body;
    if (method !== "GET" && o.data !== undefined) body = JSON.stringify(o.data);
    fetch(url, { method, headers, body })
      .then(async (res) => {
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = text; }
        o.success && o.success({ statusCode: res.status, data, header: { "x-trace-id": "sim" } });
      })
      .catch((err) => o.fail && o.fail({ errMsg: String(err) }));
    return { abort() {} };
  },
  uploadFile(o) {
    setTimeout(() => o.success && o.success({ statusCode: 200, data: JSON.stringify({ code: 0, data: { id: "f_sim", url: "http://127.0.0.1:8080/static/upload/sim.png", name: "sim.png" } }) }), 10);
    return { abort() {} };
  },
  getStorageSync(k) { return storage.has(k) ? storage.get(k) : ""; },
  setStorageSync(k, v) { storage.set(k, v); },
  removeStorageSync(k) { storage.delete(k); },
  clearStorageSync() { storage.clear(); },
  showToast(o) { logs.push("toast:" + (o && o.title)); },
  showLoading() {}, hideLoading() {},
  showModal(o) { o && o.success && o.success({ confirm: true, cancel: false }); },
  navigateTo(o) { nav.push(o.url); },
  redirectTo(o) { nav.push(o.url); },
  switchTab(o) { nav.push(o.url); },
  navigateBack() {},
  reLaunch(o) { nav.push(o.url); },
  stopPullDownRefresh() {},
  pageScrollTo() {},
  setNavigationBarTitle() {},
  getWindowInfo() { return { statusBarHeight: 20, windowWidth: 375, windowHeight: 700 }; },
  getSystemInfoSync() { return { statusBarHeight: 20, windowWidth: 375, windowHeight: 700, platform: "devtools" }; },
  createSelectorQuery() {
    const q = { select() { return q; }, selectViewport() { return q; }, boundingClientRect(cb) { cb && cb({ height: 600, top: 0 }); return q; }, exec() {}, scrollOffset() { return q; } };
    return q;
  },
  nextTick(cb) { setTimeout(cb, 0); },
  getMenuButtonBoundingClientRect() { return { top: 24, height: 32 }; },
  previewImage() {}, chooseMedia(o) { o && o.success && o.success({ tempFiles: [] }); },
  vibrateShort() {}
};
globalThis.getCurrentPages = () => [{ route: "pages/index/index" }];
globalThis.App = (cfg) => { appInstance = cfg; };
globalThis.getApp = () => appInstance;
globalThis.Page = (cfg) => { pageConfig = cfg; };
globalThis.getApp = () => appInstance;

const origWarn = console.warn, origError = console.error;
const pageWarnings = [];
console.warn = (...a) => { pageWarnings.push(a.join(" ")); };
console.error = (...a) => { pageWarnings.push("ERROR " + a.join(" ")); };

// ---------- 启动 app ----------
require(ROOT + "/app.js");
appInstance.globalData = JSON.parse(JSON.stringify(appInstance.globalData));
appInstance.onLaunch();
await appInstance.ready;
await new Promise(r => setTimeout(r, 300));

// 新版前端不再静默登录：用演示账号登录后再跑受保护页面
const authApi = require(ROOT + "/api/auth.js");
const loginResp = await authApi.passwordLogin("13843216621", "123456");
appInstance.setUser(loginResp.user);
console.log("app.ready user =", appInstance.globalData.user && appInstance.globalData.user.name,
            "| token =", storage.has("xct_token") ? "已写入" : "无");

// ---------- 页面加载器 ----------
function loadPage(rel) {
  pageConfig = null;
  delete require.cache[require.resolve(ROOT + "/" + rel)];
  require(ROOT + "/" + rel);
  if (!pageConfig) throw new Error("Page 未注册: " + rel);
  const cfg = pageConfig;
  const inst = Object.create(cfg);
  inst.data = JSON.parse(JSON.stringify(cfg.data || {}));
  inst.setData = function (patch) { for (const [k, v] of Object.entries(patch || {})) setByPath(this.data, k, v); };
  inst.route = rel;
  return inst;
}

async function runPage(rel, options, checks, wait = 900) {
  const before = pageWarnings.length;
  const page = loadPage(rel);
  try {
    if (page.onLoad) page.onLoad(options || {});
    if (page.onShow) page.onShow();
    if (page.onReady) page.onReady();
  } catch (e) {
    return { rel, ok: false, note: "onLoad 抛错: " + e.message };
  }
  await new Promise((r) => setTimeout(r, wait));
  const data = page.data;
  const issues = [];
  if (data.error) issues.push("data.error=" + data.error);
  // 检测 undefined 字段
  (function walk(o, path) {
    if (o && typeof o === "object") {
      if (Array.isArray(o)) o.forEach((v, i) => walk(v, path + "[" + i + "]"));
      else for (const k of Object.keys(o)) {
        if (o[k] === undefined) issues.push("undefined@" + path + "." + k);
        else walk(o[k], path + "." + k);
      }
    }
  })(data, "data");
  try { checks && checks(data, issues); } catch (e) { issues.push("断言:" + e.message); }
  const warns = pageWarnings.slice(before).filter(w => !/chooseMedia|previewImage/.test(w));
  if (warns.length) issues.push("warn:" + warns[0].slice(0, 80));
  return { rel, ok: issues.length === 0, note: issues.slice(0, 3).join(" | ") };
}

const results = [];
results.push(await runPage("pages/index/index", {}, (d, issues) => {
  if (!d.articles || d.articles.length !== 4) issues.push("articles=" + (d.articles || []).length);
  if (!d.columns || d.columns.length !== 4) issues.push("columns=" + (d.columns || []).length);
  if (!d.modules || d.modules.length !== 6) issues.push("modules=" + (d.modules || []).length);
  if (!d.region || d.region.households !== 486) issues.push("region.households=" + (d.region && d.region.households));
  if (!d.footer || !d.footer.icp) issues.push("footer.icp 缺失");
  if (d.loading) issues.push("loading 未结束");
}));
results.push(await runPage("pages/article/list", { columnId: "c1" }, (d, issues) => {
  const list = d.list || d.articles || [];
  if (!list.length) issues.push("资讯列表为空");
  if (d.loading) issues.push("loading 未结束");
}));
results.push(await runPage("pages/article/detail", { id: "a1001" }, (d, issues) => {
  const a = d.article || d.detail || d;
  if (!a || !a.content || a.content.length < 100) issues.push("正文缺失");
  if (!a.title) issues.push("标题缺失");
}));
results.push(await runPage("pages/gov/index", {}, (d, issues) => {
  if (!d.categories || d.categories.length < 5) issues.push("categories=" + (d.categories || []).length);
  if (!d.items || d.items.length < 6) issues.push("items=" + (d.items || []).length);
}));
results.push(await runPage("pages/gov/detail", { code: "YB001" }, (d, issues) => {
  const item = d.item || d.detail;
  if (!item) return issues.push("item 为空");
  if (!item.materials || item.materials.length !== 3) issues.push("materials=" + (item.materials || []).length);
  if (!item.formFields || !item.formFields.length) issues.push("formFields 为空");
}));
results.push(await runPage("pages/gov/apply", { code: "YB001" }, (d, issues) => {
  if (!d.fields || d.fields.length !== 5) issues.push("fields=" + (d.fields || []).length);
  if (!d.materials || d.materials.length !== 3) issues.push("materials=" + (d.materials || []).length);
}));
results.push(await runPage("pages/gov/applies", {}, (d, issues) => {
  if (!d.all || d.all.length < 3) issues.push("all=" + (d.all || []).length);
  if (!d.counts || !d.counts.all) issues.push("counts 缺失");
}));
results.push(await runPage("pages/gov/apply-detail", { id: "ap_seed_2" }, (d, issues) => {
  const a = d.apply || d.detail || d;
  if (!a || !a.statusLabel) issues.push("statusLabel 缺失");
  if (!a || !a.logs || !a.logs.length) issues.push("时间轴为空");
}));
results.push(await runPage("pages/request/create", { type: "appeal" }, () => {}));
results.push(await runPage("pages/request/list", {}, (d, issues) => {
  const list = d.list || d.requests || [];
  if (!list.length) issues.push("诉求列表为空");
}));
results.push(await runPage("pages/request/detail", { id: "rq_seed_1" }, (d, issues) => {
  const r = d.request || d.detail || d;
  if (!r || !r.logs || !r.logs.length) issues.push("时间轴为空");
}));
results.push(await runPage("pages/service/index", {}, (d, issues) => {
  const arrays = Object.values(d).filter(v => Array.isArray(v) && v.length);
  if (!arrays.length) issues.push("黄页/招聘/奶茶会数据都为空");
}));
results.push(await runPage("pages/ai/ai", {}, (d, issues) => {
  if (!d.suggestions || d.suggestions.length !== 4) issues.push("suggestions=" + (d.suggestions || []).length);
  if (!d.messages || !d.messages.length) issues.push("欢迎语缺失");
}));
results.push(await runPage("pages/ai/history", {}, () => {}));
results.push(await runPage("pages/profile/profile", {}, (d, issues) => {
  const u = d.user || {};
  if (!u.name) issues.push("user.name 缺失");
  if (!u.gridWorker) issues.push("gridWorker 缺失");
}));
results.push(await runPage("pages/profile/edit", {}, (d, issues) => {
  const u = d.user || {};
  if (!u.name) issues.push("user 缺失");
}));

console.warn = origWarn; console.error = origError;

let pass = 0;
const fail = [];
for (const r of results) {
  if (r.ok) pass++; else fail.push(r);
  console.log((r.ok ? "✅" : "❌") + " " + r.rel + (r.ok ? "" : "  → " + r.note));
}
console.log("\n页面通过 " + pass + "/" + results.length);
