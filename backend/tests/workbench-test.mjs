const BASE = "http://127.0.0.1:8080/api/v1";
const post = (p, body, token) => fetch(BASE + p, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: JSON.stringify(body || {}) }).then(r => r.json());
const get = (p, token) => fetch(BASE + p, { headers: token ? { Authorization: "Bearer " + token } : {} }).then(r => r.json());
const del = (p, token) => fetch(BASE + p, { method: "DELETE", headers: { Authorization: "Bearer " + token } }).then(r => r.json());
const put = (p, body, token) => fetch(BASE + p, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(body) }).then(r => r.json());

let ok = 0, fail = 0;
const check = (name, cond, note) => { if (cond) { ok++; console.log("✅ " + name); } else { fail++; console.log("❌ " + name + (note ? "  " + note : "")); } };

const admin = await post("/auth/password-login", { account: "13843219072", password: "123456" });
check("管理员登录", admin.code === 0 && admin.data.user.roleCode === "admin", admin.message);
const at = admin.data.token;
const villager = await post("/auth/password-login", { account: "13843216621", password: "123456" });
check("居民登录", villager.code === 0 && villager.data.user.roleCode === "villager", villager.message);
const vt = villager.data.token;

// 越权
const forb = await get("/workbench/summary", vt);
check("居民访问工作台被拒", forb.code === 20002, "code=" + forb.code);
const noauth = await get("/workbench/summary");
check("未登录访问工作台", noauth.code === 20001, "code=" + noauth.code);

// 概览
const sum = await get("/workbench/summary", at);
check("工作台概览", sum.code === 0 && sum.data.households === 20, JSON.stringify(sum.data));

// 通知 CRUD
const n1 = await post("/workbench/notices", { text: "测试通知：本周五停水", type: "urgent" }, at);
check("发布通知", n1.code === 0 && n1.data.id, n1.message);
const list1 = await get("/workbench/notices", at);
check("通知列表含新通知", list1.code === 0 && list1.data.some(x => x.text === "测试通知：本周五停水"));
const n2 = await put("/workbench/notices/" + n1.data.id, { text: "测试通知：改到周六停水", type: "normal" }, at);
check("更新通知", n2.code === 0 && n2.data.text === "测试通知：改到周六停水");
const n3 = await del("/workbench/notices/" + n1.data.id, at);
check("删除通知", n3.code === 0);

// 诉求受理流程
const rq = await post("/requests", { type: "appeal", title: "测试诉求-路灯不亮", content: "村口路灯坏了三天" }, vt);
check("居民提交诉求", rq.code === 0 && rq.data.id, rq.message);
const rid = rq.data.id;
const acc = await post("/workbench/requests/" + rid + "/accept", {}, at);
check("受理诉求", acc.code === 0 && acc.data.status === "ACCEPTED" && acc.data.statusLabel === "已受理", acc.data.status);
const rp = await post("/workbench/requests/" + rid + "/reply", { content: "已安排电工，明天修复" }, at);
check("回复诉求", rp.code === 0 && rp.data.status === "PROCESSING" && rp.data.replies.length === 1, rp.data.status);
const done = await post("/workbench/requests/" + rid + "/complete", {}, at);
check("办结诉求", done.code === 0 && done.data.status === "COMPLETED" && done.data.statusLabel === "已办结", done.data.status);

// 诉求列表（管理员）
const rlist = await get("/workbench/requests?status=all&page=1&pageSize=10", at);
check("诉求列表", rlist.code === 0 && rlist.data.total >= 3, "total=" + rlist.data.total);

// 户籍统计
const st = await get("/workbench/statistics/household?regionId=22022110001", at);
check("户籍统计-户数人口", st.code === 0 && st.data.households === 20 && st.data.population === 70, JSON.stringify({ h: st.data.households, p: st.data.population }));
check("户籍统计-网格", st.data.grids.length === 3, "grids=" + st.data.grids.length);
check("户籍统计-性别", st.data.gender.male + st.data.gender.female === 70, JSON.stringify(st.data.gender));

console.log("workbench PASS=" + ok + " FAIL=" + fail);
