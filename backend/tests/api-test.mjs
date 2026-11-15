
const BASE = "http://127.0.0.1:8080/api/v1";
const results = [];
let token = "";
async function call(method, path, { body, auth = true, form } = {}) {
  const headers = { "X-Client": "wx-miniprogram", "X-Client-Version": "1.1.0" };
  if (auth && token) headers.Authorization = "Bearer " + token;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const t0 = Date.now();
  const res = await fetch(BASE + path, { method, headers, body: payload });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, ms: Date.now() - t0 };
}
function check(name, r, fn) {
  let ok = false, note = "";
  try { const v = fn(r); ok = v !== false; note = typeof v === "string" ? v : ""; }
  catch (e) { note = "断言异常: " + e.message; }
  results.push({ name, status: r.status, code: r.json && r.json.code, ok, note, ms: r.ms });
  return r;
}
const eq = (a, b, label) => { if (a !== b) throw new Error(label + " 期望 " + b + " 实际 " + a); };

// 1 登录
let r = await call("POST", "/auth/mock-login", { body: { regionId: "22022110001" }, auth: false });
token = r.json.data.token;
check("mock-login", r, (x) => { eq(x.json.code, 0, "code"); eq(x.json.data.tokenType, "Bearer", "tokenType"); eq(x.json.data.user.name, "王秀兰", "user.name"); eq(x.json.data.user.stats.applies, 3, "stats.applies"); return "user=" + x.json.data.user.name; });

// 2 首页
r = await call("GET", "/home", { auth: false });
check("home", r, (x) => { const d = x.json.data; eq(d.columns.length, 4, "columns"); eq(d.modules.length, 6, "modules"); eq(d.articles.length, 4, "articles"); eq(d.region.households, 486, "households"); return "栏目4/入口6/资讯4"; });

// 3 栏目 / 资讯
r = await call("GET", "/columns", { auth: false });
check("columns", r, (x) => { eq(x.json.data.list.length, 4, "list"); return "4 个栏目"; });
r = await call("GET", "/articles?page=1&pageSize=10", { auth: false });
check("articles", r, (x) => { eq(x.json.data.total, 10, "total"); eq(x.json.data.pageSize, 10, "pageSize"); eq(x.json.data.list[0].isTop, true, "置顶优先"); return "total=10 首条置顶"; });
r = await call("GET", "/articles?columnId=c1&page=1&pageSize=5", { auth: false });
check("articles?columnId", r, (x) => { const all = x.json.data.list.every(a => a.columnId === "c1"); if (!all) throw new Error("栏目过滤失败"); return "c1 共 " + x.json.data.total; });
r = await call("GET", "/articles/a1001", { auth: false });
check("article detail", r, (x) => { const d = x.json.data; if (!d.content || !d.content.includes("380")) throw new Error("正文缺失"); if (typeof d.liked !== "boolean") throw new Error("liked 类型"); return "浏览=" + d.views + " 上下篇=" + (d.prev ? "有" : "无") + "/" + (d.next ? "有" : "无"); });
r = await call("POST", "/articles/a1001/like", { body: { liked: true } });
check("like", r, (x) => { eq(x.json.data.liked, true, "liked"); if (typeof x.json.data.likes !== "number") throw new Error("likes 非数字"); return "likes=" + x.json.data.likes; });
r = await call("POST", "/articles/a1001/like", { body: { liked: false } });
check("unlike", r, (x) => { eq(x.json.data.liked, false, "liked"); return "likes=" + x.json.data.likes; });

// 4 配置/入口/区域/字典
r = await call("GET", "/app/config", { auth: false });
check("app/config", r, (x) => { const d = x.json.data; eq(d.appName, "新源村情通", "appName"); if (!d.footer || !d.features) throw new Error("footer/features 缺失"); return "features.onlineApply=" + d.features.onlineApply; });
r = await call("GET", "/modules", { auth: false });
check("modules", r, (x) => { eq(x.json.data.list.length, 6, "list"); const gov = x.json.data.list.find(m => m.code === "gov"); eq(gov.status, "online", "政务入口"); return "政务管理 " + gov.status; });
r = await call("GET", "/regions/tree", { auth: false });
check("regions/tree", r, (x) => { eq(x.json.data.tree[0].name, "永吉县", "根节点"); eq(x.json.data.currentId, "22022110001", "currentId"); return "4 村"; });
r = await call("GET", "/dicts/applyStatus", { auth: false });
check("dicts", r, (x) => { eq(x.json.data.type, "applyStatus", "type"); eq(x.json.data.list.length, 9, "list"); return "9 个状态"; });

// 5 政务
r = await call("GET", "/gov/categories", { auth: false });
check("gov/categories", r, (x) => { eq(x.json.data.total, 6, "total"); const all = x.json.data.list.find(c => c.id === "all"); eq(all.count, 6, "all.count"); return "6 项 5 类"; });
r = await call("GET", "/gov/items?categoryId=social", { auth: false });
check("gov/items", r, (x) => { if (x.json.data.total < 2) throw new Error("社保类事项过少"); return "social=" + x.json.data.total; });
r = await call("GET", "/gov/items?keyword=医保", { auth: false });
check("gov/items?keyword", r, (x) => { if (x.json.data.total < 1) throw new Error("关键词无结果"); return "命中 " + x.json.data.total; });
r = await call("GET", "/gov/items/YB001", { auth: false });
check("gov item detail", r, (x) => { const d = x.json.data; eq(d.code, "YB001", "code"); if (!Array.isArray(d.materials) || !d.materials.length) throw new Error("materials"); if (!Array.isArray(d.formFields) || !d.formFields.length) throw new Error("formFields"); return "材料" + d.materials.length + "/表单" + d.formFields.length + "/步骤" + d.steps.length; });

// 6 申报
r = await call("POST", "/gov/applies", { body: {
  itemCode: "YB001",
  formData: { "参保人姓名": "王秀兰", "身份证号": "220221********0026", "参保年度": "2026 年度", "人员类别": "普通居民", "联系电话": "138****6621" },
  materialNames: ["身份证或户口簿"], fileIds: []
} });
let applyId = r.json.data && r.json.data.id;
check("gov apply create", r, (x) => { const d = x.json.data; eq(d.status, "SUBMITTED", "status"); if (!/^SB\d{8}\d{4}$/.test(d.applyNo)) throw new Error("办件号格式 " + d.applyNo); eq(d.amount, 38000, "金额（分）"); if (!d.logs.length) throw new Error("时间轴"); return d.applyNo + " 承诺 " + d.promiseAt; });
r = await call("POST", "/gov/applies", { body: { itemCode: "YB001", formData: { "参保人姓名": "王秀兰" }, materialNames: [] } });
check("gov apply 缺字段→40001", r, (x) => { eq(x.json.code, 40001, "code"); if (!x.json.message.includes("请填写")) throw new Error("文案"); return x.json.message; });
r = await call("GET", "/gov/applies", {});
check("my applies", r, (x) => { if (!x.json.data.list.length) throw new Error("列表为空"); return "total=" + x.json.data.total; });
r = await call("GET", "/gov/applies/" + applyId, {});
check("apply detail", r, (x) => { const d = x.json.data; eq(d.canCancel, true, "canCancel"); if (!d.materials.length) throw new Error("materials"); return "状态=" + d.statusLabel; });
r = await call("POST", "/gov/applies/" + applyId + "/cancel", { body: { reason: "接口测试撤销" } });
check("apply cancel", r, (x) => { eq(x.json.data.status, "CANCELED", "status"); return x.json.data.statusLabel; });
r = await call("POST", "/gov/applies/ap_seed_2/rate", { body: { score: 5, comment: "办得快" } });
check("apply rate", r, (x) => { eq(x.json.data.ratingScore, 5, "ratingScore"); eq(x.json.data.hasRated, true, "hasRated"); return "5 星"; });
r = await call("POST", "/gov/applies/ap_seed_2/rate", { body: { score: 4 } });
check("重复评价→40001", r, (x) => { eq(x.json.code, 40001, "code"); return x.json.message; });
r = await call("POST", "/gov/applies/ap_seed_2/pay", {});
check("pay→40004", r, (x) => { eq(x.json.code, 40004, "code"); return x.json.message; });

// 7 诉求
r = await call("POST", "/requests", { body: { type: "appeal", title: "接口测试：路灯不亮", content: "三组东侧路灯坏了，晚上看不清路，希望尽快维修。", location: "三组", contactPhone: "138****6621", photos: [] } });
const reqId = r.json.data && r.json.data.id;
check("request create", r, (x) => { const d = x.json.data; eq(d.status, "PENDING", "status"); if (!/^QZ\d{8}\d{4}$/.test(d.requestNo)) throw new Error("受理号格式"); return d.requestNo; });
r = await call("GET", "/requests", {});
check("request list", r, (x) => "total=" + x.json.data.total);
r = await call("GET", "/requests/" + reqId, {});
check("request detail", r, (x) => { eq(x.json.data.canUrge, true, "canUrge"); return "status=" + x.json.data.statusLabel; });
r = await call("POST", "/requests/" + reqId + "/urge", {});
check("request urge", r, (x) => { eq(x.json.data.urgeCount, 1, "urgeCount"); return x.json.data.message; });
r = await call("POST", "/requests/rq_seed_2/rate", { body: { score: 5, comment: "回复很快" } });
check("request rate", r, (x) => { eq(x.json.data.status, "RATED", "status"); eq(x.json.data.hasRated, true, "hasRated"); return x.json.data.statusLabel; });

// 8 便民
r = await call("GET", "/directory", { auth: false });
check("directory", r, (x) => { eq(x.json.data.list.length, 8, "list"); if (!x.json.data.categories.length) throw new Error("categories"); return x.json.data.categories.join("/"); });
r = await call("GET", "/jobs", { auth: false });
check("jobs", r, (x) => { eq(x.json.data.total, 4, "total"); return "4 个岗位"; });
r = await call("GET", "/tea-meetings", { auth: false });
check("tea-meetings", r, (x) => { eq(x.json.data.total, 3, "total"); return "3 场"; });

// 9 AI
r = await call("GET", "/ai/suggestions", { auth: false });
check("ai suggestions", r, (x) => { eq(x.json.data.list.length, 4, "list"); if (!x.json.data.welcome) throw new Error("welcome"); return "4 条推荐"; });
r = await call("POST", "/ai/chat", { body: { question: "今年医保怎么缴" } });
const convId = r.json.data.conversationId, msgId = r.json.data.messageId;
check("ai chat", r, (x) => { const d = x.json.data; if (!d.answer.includes("380")) throw new Error("答案未包含金额"); if (!d.refs.length) throw new Error("无引用"); eq(d.refs[0].type, "article", "ref.type"); return "答案" + d.answer.length + "字 引用" + d.refs.length; });

// SSE
{
  const t0 = Date.now();
  const res = await fetch(BASE + "/ai/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: "Bearer " + token },
    body: JSON.stringify({ question: "独生子女证需要什么材料" })
  });
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = "", events = [], deltas = 0, done = null, gotRefs = 0;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const { value, done: d } = await reader.read(); if (d) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, i); buf = buf.slice(i + 2);
      const ev = (/event:\s*(.*)/.exec(raw) || [])[1];
      const da = (/data:\s*([\s\S]*)/.exec(raw) || [])[1];
      if (!ev) continue;
      events.push(ev.trim());
      if (ev.trim() === "delta") { deltas++; JSON.parse(da); }
      if (ev.trim() === "refs") { gotRefs = JSON.parse(da).refs.length; }
      if (ev.trim() === "done") { done = JSON.parse(da); break; }
    }
    if (done) break;
  }
  results.push({ name: "ai chat/stream", status: res.status, code: done ? 0 : -1,
    ok: res.status === 200 && events[0] === "meta" && deltas > 0 && !!done && gotRefs > 0,
    note: "事件=" + [...new Set(events)].join("→") + " delta=" + deltas + " 引用=" + gotRefs + " followUps=" + (done ? done.followUps.length : 0),
    ms: Date.now() - t0 });
}
r = await call("POST", "/ai/messages/" + msgId + "/feedback", { body: { feedback: "up" } });
check("ai feedback", r, (x) => { eq(x.json.data.feedback, "up", "feedback"); return "up"; });
r = await call("GET", "/ai/conversations", {});
check("ai conversations", r, (x) => { if (x.json.data.total < 1) throw new Error("无会话"); return "total=" + x.json.data.total; });
r = await call("GET", "/ai/conversations/" + convId + "/messages", {});
check("ai messages", r, (x) => { const list = x.json.data.list; if (list.length < 2) throw new Error("消息不足"); if (!list.some(m => m.role === "assistant" && m.refs)) throw new Error("助手消息无引用"); return list.length + " 条"; });
r = await call("DELETE", "/ai/conversations/" + convId, {});
check("ai delete conversation", r, (x) => { eq(x.json.data, true, "data"); return "true"; });

// 10 用户
r = await call("GET", "/users/me", {});
check("users/me", r, (x) => { const d = x.json.data; eq(d.gridName, "第三网格", "gridName"); eq(d.gridWorker.name, "李建国", "gridWorker"); eq(d.regionPath.length, 3, "regionPath"); return d.name + "/" + d.roleName + "/" + d.stats.applies + " 件"; });
r = await call("PUT", "/users/me", { body: { nickname: "王秀兰" } });
check("users/me 修改", r, (x) => { eq(x.json.data.nickname, "王秀兰", "nickname"); return "ok"; });
r = await call("PUT", "/users/me", { body: { nickname: "x" } });
check("昵称过短→40001", r, (x) => { eq(x.json.code, 40001, "code"); return x.json.message; });

// 11 埋点 + 上传
r = await call("POST", "/events", { body: { eventCode: "article_view", payload: { articleId: "a1001" }, page: "pages/article/detail", ts: Date.now() } });
check("events", r, (x) => { eq(x.json.data, true, "data"); return "ok"; });
const form = new FormData();
form.append("file", new Blob([Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfabd40000000049454e44ae426082", "hex")], { type: "image/png" }), "头像.png");
form.append("bizType", "avatar");
r = await call("POST", "/files", { form });
check("files", r, (x) => { if (!x.json.data.url || !x.json.data.id) throw new Error("缺 url/id"); return x.json.data.url.replace(/^.*\/static/, "/static"); });

// 12 预留 + 错误
r = await call("GET", "/workbench/summary", {});
check("workbench→需管理员", r, (x) => { eq(x.json.code, 20002, "code"); return x.json.message; });
r = await call("GET", "/points", {});
check("points→40004", r, (x) => { eq(x.json.code, 40004, "code"); return x.json.message; });
r = await call("GET", "/articles/nope", { auth: false });
check("文章不存在→40401", r, (x) => { eq(x.json.code, 40401, "code"); return x.json.message; });
r = await call("GET", "/gov/items/XXX", { auth: false });
check("事项不存在→40402", r, (x) => { eq(x.json.code, 40402, "code"); return x.json.message; });
r = await call("GET", "/users/me", { auth: false });
check("未登录→20001", r, (x) => { eq(x.status, 401, "http"); eq(x.json.code, 20001, "code"); return x.json.message; });
r = await call("POST", "/ai/chat", { body: { question: "" } });
check("空问题→40001", r, (x) => { eq(x.json.code, 40001, "code"); return x.json.message; });

const pass = results.filter(x => x.ok).length;
const fail = results.filter(x => !x.ok);
console.log("TOTAL=" + results.length + " PASS=" + pass + " FAIL=" + fail.length);
if (fail.length) { console.log("FAILURES:"); fail.forEach(f => console.log("  " + f.name + " -> " + f.status + "/" + f.code + " " + f.note)); }
for (const x of results) console.log((x.ok ? "✅" : "❌") + " " + x.name.padEnd(28) + " " + String(x.status).padEnd(4) + " code=" + String(x.code).padEnd(6) + " " + String(x.ms).padStart(5) + "ms  " + x.note);
const fsmod = await import("node:fs");
fsmod.writeFileSync("api-test.json", JSON.stringify(results, null, 2));
