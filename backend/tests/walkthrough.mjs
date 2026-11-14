
const B = "http://127.0.0.1:8080/api/v1";
const get = (p, t) => fetch(B + p, { headers: t ? { Authorization: "Bearer " + t } : {} }).then(r => r.json());
const post = (p, body, t) => fetch(B + p, { method: "POST", headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}) }, body: JSON.stringify(body || {}) }).then(r => r.json());
const line = (s) => console.log(s);

line("================ 新源村情通 · 本地联调演示 ================\n");

// 1 登录
let r = await post("/auth/mock-login", { regionId: "22022110001" });
const token = r.data.token;
const u = r.data.user;
line("① 登录（POST /auth/mock-login）");
line("   " + u.name + " / " + u.roleName + " / " + u.regionPath.join(" · ") + " / " + u.gridName);
line("   token: " + token.slice(0, 28) + "...  有效期 " + r.data.expiresIn + "s\n");

// 2 首页
r = await get("/home");
const h = r.data;
line("② 首页（GET /home，一次拿齐首屏）");
line("   村情：" + h.region.name + "（" + h.region.fullName + "）户数 " + h.region.households + " 人口 " + h.region.population);
line("   通知：" + h.notice.text);
line("   横幅：" + h.banner.title + " · " + h.banner.titleHighlight);
line("   栏目：" + h.columns.map(c => c.name).join(" / "));
line("   资讯：");
h.articles.forEach((a, i) => line("     " + (i + 1) + ". [" + a.displayDate + "] " + a.title.slice(0, 26) + "…  " + a.views + " 阅读"));
line("   入口：" + h.modules.map(m => m.name + (m.status === "online" ? "✓" : "（" + m.version + "）")).join("  "));
line("   页脚：" + h.footer.organizer + " · " + h.footer.icp + "\n");

// 3 资讯
r = await get("/articles/a1001", token);
line("③ 资讯详情（GET /articles/a1001）");
line("   " + r.data.title);
line("   浏览 " + r.data.views + " · 点赞 " + r.data.likes + " · 作者 " + r.data.author + " · 正文 " + r.data.content.length + " 字符");
r = await post("/articles/a1001/like", { liked: true }, token);
line("   点赞 → liked=" + r.data.liked + " likes=" + r.data.likes);
r = await post("/articles/a1001/like", { liked: false }, token);
line("   取消 → liked=" + r.data.liked + " likes=" + r.data.likes + "\n");

// 4 政务
r = await get("/gov/categories");
line("④ 政务（GET /gov/categories）");
line("   " + r.data.list.map(c => c.name + "(" + c.count + ")").join("  "));
r = await get("/gov/items/YB001");
const item = r.data;
line("   事项：" + item.name + " · " + item.fee + " · 承诺 " + item.promiseDays + " 天");
line("   材料：" + item.materials.map(m => m.name + (m.required ? "*" : "")).join("、"));
line("   表单：" + item.formFields.map(f => f.label + "(" + f.type + ")").join("、"));
line("   条件：" + item.conditions[0] + "…\n");

// 5 申报
const formData = { "参保人姓名": "王秀兰", "身份证号": "220221********0026", "参保年度": "2026 年度", "人员类别": "普通居民", "联系电话": "138****6621" };
r = await post("/gov/applies", { itemCode: "YB001", formData: { "参保人姓名": "王秀兰" }, materialNames: [] }, token);
line("⑤ 申报（先故意漏填）");
line("   → code=" + r.code + " " + r.message);
r = await post("/gov/applies", { itemCode: "YB001", formData, materialNames: ["身份证或户口簿"] }, token);
const apply = r.data;
line("   重新提交 → " + apply.applyNo + " / " + apply.statusLabel + " / 金额 " + (apply.amount / 100) + " 元 / 承诺 " + apply.promiseAt);
line("   时间轴：" + apply.logs.map(l => l.label + "@" + l.time).join(" → "));
line("   缺材料提醒：" + (apply.missingMaterials.length ? apply.missingMaterials.join("、") : "无") + "\n");

// 6 我的办件
r = await get("/gov/applies", token);
line("⑥ 我的办件（GET /gov/applies）");
r.data.list.slice(0, 4).forEach(a => line("   " + a.applyNo + "  " + a.itemShortName + "  " + a.statusLabel + "  " + (a.amount / 100) + "元"));
line("");

// 7 AI
r = await get("/ai/suggestions");
line("⑦ AI 网格员（GET /ai/suggestions）");
line("   推荐问：" + r.data.list.map(s => s.text).join(" | "));
line("   提问：今年医保怎么缴");

const res = await fetch(B + "/ai/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: "Bearer " + token },
  body: JSON.stringify({ question: "今年医保怎么缴" })
});
const reader = res.body.getReader(); const dec = new TextDecoder();
let buf = "", answer = "", events = [], refs = [], doneInfo = null;
const deadline = Date.now() + 20000;
while (Date.now() < deadline) {
  const { value, done } = await reader.read(); if (done) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
    const raw = buf.slice(0, i); buf = buf.slice(i + 2);
    const ev = (/event:\s*(.*)/.exec(raw) || [])[1]?.trim();
    const da = (/data:\s*([\s\S]*)/.exec(raw) || [])[1];
    if (!ev) continue;
    events.push(ev);
    const payload = JSON.parse(da);
    if (ev === "delta") answer += payload.text;
    if (ev === "refs") refs = payload.refs;
    if (ev === "done") { doneInfo = payload; break; }
  }
  if (doneInfo) break;
}
line("   流式事件：" + events[0] + " → delta×" + events.filter(e => e === "delta").length + " → " + events[events.length - 1]);
line("   回答（前 60 字）：" + answer.slice(0, 60).replace(/\n/g, " ") + "…");
line("   引用：" + refs.map(x => x.title.slice(0, 18)).join(" | "));
line("   追问：" + doneInfo.followUps.join(" | "));
line("   首字-完成耗时：" + doneInfo.latencyMs + "ms\n");

// 8 个人中心
r = await get("/users/me", token);
line("⑧ 个人中心（GET /users/me）");
line("   " + r.data.name + " · " + r.data.houseNo + " · 认证：" + (r.data.isVerified ? "已实名" : "未实名"));
line("   网格员：" + r.data.gridWorker.name + " " + r.data.gridWorker.phoneDisplay + "（" + r.data.gridWorker.duty + "）");
line("   统计：办件 " + r.data.stats.applies + " / 诉求 " + r.data.stats.appeals + " / 待评价 " + r.data.stats.ratings + "\n");

// 9 预留
r = await get("/workbench/summary", token);
line("⑨ 预留能力（V3）");
line("   → code=" + r.code + " " + r.message);
line("\n================ 演示结束，服务仍在 8080 运行 ================");
