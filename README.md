# WeChar 小程序（客户端 + Mock 服务）

微信小程序「智慧社区」用户端，前后端分离：客户端可直接使用内置 Mock，也可以切换到 `temp/mock-server` 提供的真实 HTTP + SSE 服务。

## 目录结构

```
cilent/                  微信小程序客户端（用微信开发者工具打开这个目录）
  pages/                 页面
  api/                   接口封装（request.js 统一 Result 解析、token、错误码）
  mock/                  内置 Mock 数据与处理器（USE_MOCK 时生效）
  utils/                 工具（config.js 里是 BASE_URL 与 USE_MOCK 开关）
  assets/                图标等静态资源
  app.js / app.json / app.wxss
  project.config.json    小程序项目配置（appid 已内置）
  project.private.config.json  开发者工具个人设置（含 urlCheck:false）

temp/                    文档与开发辅助
  mock-server/           独立 Mock 服务（Node，无第三方依赖）
    server.js            提供 /api/v1 全套接口 + SSE 流式 AI 问答
    start.cmd            双击启动
  tools/                 校验与冒烟脚本（check-data / check-wxml / test-*.js）
  接口契约-v1.md          前后端接口契约（字段、错误码、SSE 事件）
  接口总表.md             接口清单与完成状态
  V1-交付说明.md           V1 交付范围
  V2-用户端补全说明.md      V2 补充说明
  05-设计思路与版本功能清单.md  产品设计思路与版本规划
```

## 本地运行

**小程序**：用微信开发者工具打开 `cilent/`。默认走内置 Mock（`cilent/utils/config.js` 的 `USE_MOCK`）。

**Mock 服务**：

```bash
cd temp/mock-server
node server.js        # 或双击 start.cmd
```

默认监听 `http://127.0.0.1:3000/api/v1`，健康检查 `GET /health`。

真机调试：把 `cilent/utils/config.js` 的 `BASE_URL` 改成电脑局域网 IP，并确保手机与电脑同一 Wi-Fi；开发者工具「详情 → 本地设置」勾选“不校验合法域名”。

## 协作规范（两人同时改）

1. **动手前先同步**：`git pull --rebase`
2. **改完就提交**：小步提交，提交信息写清改了什么模块（如 `feat(ai): SSE 断线重连`）
3. **推送前再同步**：`git pull --rebase` 然后 `git push`
4. **不要 `git push --force`**：会覆盖对方的提交
5. **大改动开分支**：`git switch -c feat/xxx`，完成后合并到 `main`
6. **冲突处理**：优先保留双方逻辑，改完在开发者工具里跑一遍页面再提交

## 约定

- `main` 为唯一长期分支，保持随时可运行
- Mock 服务与客户端 `cilent/mock/` 的数据要保持一致（`temp/tools/check-data.js` 可校验）
- 接口有任何变更，先改 `temp/接口契约-v1.md`，再改两端实现
