
const B = "http://127.0.0.1:8080/api/v1";
const post = (p, b, t) => fetch(B + p, { method: "POST", headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}) }, body: JSON.stringify(b || {}) }).then(async r => ({ status: r.status, body: await r.json() }));

let r = await post("/auth/password-login", { account: "13843216621", password: "123456" });
console.log("password-login ok:", r.status, r.body.code, r.body.data && r.body.data.user.name, "| phone:", r.body.data && r.body.data.user.phone);
const token = r.body.data && r.body.data.token;

r = await post("/auth/password-login", { account: "13900000000", password: "wrong" });
console.log("wrong password:", r.status, r.body.code, r.body.message);

r = await post("/auth/password-login", { account: "", password: "" });
console.log("empty:", r.status, r.body.code, r.body.message);

const home = await fetch(B + "/home").then(x => x.json());
console.log("home:", home.data.region.name, "|", home.data.region.fullName, "| icp:", home.data.footer.icp);

const me = await fetch(B + "/users/me", { headers: { Authorization: "Bearer " + token } }).then(x => x.json());
console.log("me:", me.data.name, me.data.phone, me.data.regionPath.join("/"), "| gridWorker:", me.data.gridWorker.phone);

const chat = await post("/ai/chat", { question: "今年医保怎么缴" }, token);
const ans = chat.body.data && chat.body.data.answer || "";
console.log("ai:", chat.body.code, "| 含吉林:", ans.includes("吉林"), "| 含0432:", ans.includes("0432"), "| 含新疆:", ans.includes("新疆"));
