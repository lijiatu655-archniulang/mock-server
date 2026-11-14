
const B = "http://127.0.0.1:8080/api/v1";
const home = await fetch(B + "/home").then(r => r.json());
const login = await fetch(B + "/auth/password-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account: "13843216621", password: "123456" }) }).then(r => r.json());
console.log("home:", home.code, home.data.region.fullName, "| icp:", home.data.footer.icp, "| articles:", home.data.articles.length);
console.log("password-login:", login.code, login.data && login.data.user.name, "| phone:", login.data && login.data.user.phone);
