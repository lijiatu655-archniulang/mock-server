
const BASE = "http://127.0.0.1:8080/api/v1";
const login = await fetch(BASE + "/auth/mock-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then(r => r.json());
const token = login.data.token;
const cases = [
  ["GET", "/workbench/applies"], ["GET", "/workbench/requests"],
  ["POST", "/workbench/visits"], ["GET", "/workbench/visits"],
  ["POST", "/workbench/events"], ["POST", "/workbench/events/e1/transfer"],
  ["GET", "/users/family"], ["POST", "/users/family"], ["POST", "/ai/agent/exec"],
  ["POST", "/share/track"]
];
let pass = 0;
for (const [m, p] of cases) {
  const res = await fetch(BASE + p, { method: m, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: m === "GET" ? undefined : "{}" });
  const j = await res.json();
  const ok = j.code === 40004;
  if (ok) pass++;
  console.log((ok ? "✅" : "❌") + " " + m + " " + p + " -> " + res.status + "/" + j.code + " " + j.message);
}
console.log("reserved PASS=" + pass + "/" + cases.length + "  (含前面已测 pay/points/workbench summary)");
