
const B = "http://127.0.0.1:8080/api/v1";
const login = await fetch(B + "/auth/mock-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then(r => r.json());
const t = login.data.token;
const home = await fetch(B + "/home").then(r => r.json());
const me = await fetch(B + "/users/me", { headers: { Authorization: "Bearer " + t } }).then(r => r.json());
const applies = await fetch(B + "/gov/applies", { headers: { Authorization: "Bearer " + t } }).then(r => r.json());
console.log("login.user:", login.data.user.name, "| stats:", JSON.stringify(login.data.user.stats));
console.log("home:", home.data.region.name, "| articles:", home.data.articles.length, "| modules:", home.data.modules.length);
console.log("me.stats:", JSON.stringify(me.data.stats), "| gridWorker:", me.data.gridWorker.name);
console.log("seed applies:", applies.data.total);
