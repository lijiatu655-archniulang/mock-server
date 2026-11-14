
const B = process.env.BASE || "http://127.0.0.1:8081/api/v1";
const login = await fetch(B + "/auth/password-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account: "13843216621", password: "123456" }) }).then(r => r.json());
const t = login.data.token;
const ask = async (q) => {
  const r = await fetch(B + "/ai/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ question: q }) }).then(x => x.json());
  return r.data;
};

for (const q of ["医保怎么缴", "高龄补贴怎么申请", "独生子女证要什么材料", "今天天气怎么样"]) {
  const d = await ask(q);
  console.log("[" + q + "] refs=" + d.refs.length + " " + d.refs.map(r => r.title.slice(0, 14)).join(" | "));
  console.log("   answer:", d.answer.slice(0, 70).replace(/\n/g, " "));
}

const started = Date.now();
const res = await fetch(B + "/ai/chat/stream", { method: "POST", headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: "Bearer " + t }, body: JSON.stringify({ question: "养老保险要交多少年" }) });
const reader = res.body.getReader(); const dec = new TextDecoder();
let buf = "", evs = [], deltas = 0, done = null, answer = "";
while (true) {
  const { value, done: d } = await reader.read(); if (d) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf("\n\n")) >= 0) {
    const raw = buf.slice(0, i); buf = buf.slice(i + 2);
    const ev = (/event:\s*(.*)/.exec(raw) || [])[1]?.trim();
    const da = (/data:\s*([\s\S]*)/.exec(raw) || [])[1];
    if (!ev) continue;
    evs.push(ev);
    if (ev === "delta") { answer += JSON.parse(da).text; deltas++; }
    if (ev === "done") done = JSON.parse(da);
  }
  if (done) break;
}
console.log("stream events:", [...new Set(evs)].join("→"), "| deltas:", deltas, "| ms:", Date.now() - started);
console.log("stream answer:", answer.slice(0, 80).replace(/\n/g, " "), "| msg:", done.messageId);

const msgs = await fetch(B + "/ai/conversations/" + done.conversationId + "/messages", { headers: { Authorization: "Bearer " + t } }).then(x => x.json());
const last = msgs.data.list[msgs.data.list.length - 1];
console.log("persisted:", last.role, "| len:", last.content.length, "| refs:", (last.refs || []).length, "| followUps:", (last.followUps || []).length);
