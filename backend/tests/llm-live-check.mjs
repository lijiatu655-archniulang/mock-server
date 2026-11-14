
const B = process.env.BASE || "http://127.0.0.1:8080/api/v1";
const login = await fetch(B + "/auth/password-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account: "13843216621", password: "123456" }) }).then(r => r.json());
const t = login.data.token;

async function ask(q) {
  const t0 = Date.now();
  const r = await fetch(B + "/ai/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ question: q }) }).then(x => x.json());
  const d = r.data || {};
  console.log("[" + (Date.now() - t0) + "ms refs=" + (d.refs || []).length + "] " + q);
  console.log("  " + (d.answer || r.message || "").slice(0, 160).replace(/\n/g, " "));
}

for (const q of ["医保怎么缴", "高龄补贴怎么申请", "独生子女证需要什么材料", "我想开个小卖部要办什么手续", "今天天气怎么样"]) {
  await ask(q);
}
