# V1 + V2 用户端 Mock 服务

用于验证前后端分离链路：小程序把 `cilent/utils/config.js` 的 `USE_MOCK` 改为 `false` 后，真实走 HTTP 与 SSE。

## 启动

双击 `start.cmd`，或：

```bash
cd temp/mock-server
node server.js
```

默认地址：`http://127.0.0.1:3000/api/v1`

> 真机调试时，把 `cilent/utils/config.js` 的 `BASE_URL` 改成电脑的局域网 IP（如 `http://192.168.1.20:3000/api/v1`），并确保手机和电脑在同一 Wi-Fi。

## 验证

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/api/v1/home
curl -N -X POST http://127.0.0.1:3000/api/v1/ai/chat/stream ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"今年医保怎么缴\"}"
```

> 小程序开发工具需在「详情 → 本地设置」勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”。项目已默认 `urlCheck: false`。

## 说明

- 数据复用 `cilent/mock/data.js`，接口行为复用 `cilent/mock/index.js`，因此 Mock 服务与内置 Mock 的结果保持一致。
- 这是开发用 Mock，不是生产后端；生产后端按 `temp/接口契约-v1.md` 实现即可无缝替换。
- SSE 已设置 `X-Accel-Buffering: no`，如后续经 Nginx 转发，请同时关闭该路径的缓冲。
