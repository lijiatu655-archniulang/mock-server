const BASE = "http://127.0.0.1:8080/api/v1";
const post = (p, body, token) => fetch(BASE + p, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: JSON.stringify(body || {}) }).then(r => r.json());
const get = (p, token) => fetch(BASE + p, { headers: token ? { Authorization: "Bearer " + token } : {} }).then(r => r.json());
const put = (p, body, token) => fetch(BASE + p, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(body) }).then(r => r.json());
const del = (p, token) => fetch(BASE + p, { method: "DELETE", headers: { Authorization: "Bearer " + token } }).then(r => r.json());

let ok = 0, fail = 0;
const check = (name, cond, note) => { if (cond) { ok++; console.log("✅ " + name); } else { fail++; console.log("❌ " + name + (note ? "  " + note : "")); } };

const login = await post("/auth/password-login", { account: "13843216621", password: "123456" });
const t = login.data.token;

const noauth = await get("/users/family");
check("未登录访问家庭", noauth.code === 20001, "code=" + noauth.code);

const created = await post("/users/family", { name: "王小明", relation: "子女", gender: "男", age: 10, phone: "13800000001", idCardMasked: "220221********1234", isGuardian: 1 }, t);
check("添加家庭成员", created.code === 0 && created.data.id && created.data.name === "王小明", created.message);

const l1 = await get("/users/family", t);
check("家庭列表", l1.code === 0 && l1.data.length === 1, "len=" + l1.data.length);

const upd = await put("/users/family/" + created.data.id, { name: "王小明", age: 11 }, t);
check("更新成员年龄", upd.code === 0 && upd.data.age === 11, "age=" + upd.data.age);

const d = await del("/users/family/" + created.data.id, t);
check("删除成员", d.code === 0);
const l2 = await get("/users/family", t);
check("删除后为空", l2.data.length === 0);

console.log("family PASS=" + ok + " FAIL=" + fail);
