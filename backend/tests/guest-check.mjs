
const B = "http://127.0.0.1:8080/api/v1";
const j = async (p, o) => { const r = await fetch(B + p, o); return { status: r.status, body: await r.json() }; };
const login = await j("/auth/password-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account: "13843216621", password: "123456" }) });
const t = login.body.data.token;

const contact = await j("/ai/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ question: "村委会电话和地址" }) });
const ans = contact.body.data.answer;
console.log("contact answer 含0432:", ans.includes("0432-64216888"), "| 含新疆:", ans.includes("新疆"));

const guestHome = await j("/home");
const guestAi = await j("/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "医保" }) });
const guestGov = await j("/gov/items/YB001");
console.log("guest home:", guestHome.status, guestHome.body.code, "| guest ai:", guestAi.status, guestAi.body.code, "| guest gov:", guestGov.status, guestGov.body.code);

const badItem = await j("/gov/items/XXX");
console.log("item 40402:", badItem.status, badItem.body.code);
