
const B = "http://127.0.0.1:8080/api/v1";
const r = await fetch(B + "/auth/wx-login", { method: "POST", headers: { "Content-Type": "application/json", "X-Client": "wx-miniprogram" }, body: JSON.stringify({ code: "devtools-fake-code", regionId: "65402510001" }) });
const j = await r.json();
console.log("wx-login:", r.status, "code=" + j.code, "user=" + (j.data && j.data.user ? j.data.user.name : j.message));
const me = await fetch(B + "/users/me", { headers: { Authorization: "Bearer " + j.data.token } }).then(x => x.json());
console.log("token 可用:", me.code === 0, "| 统计:", JSON.stringify(me.data.stats));
