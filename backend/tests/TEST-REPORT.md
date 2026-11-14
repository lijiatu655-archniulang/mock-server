# 联调测试报告 · 新源村情通

> 时间：2026-11-14 23:20 ｜ 环境：Windows + JDK 17 + Spring Boot 3.2.12 + MySQL 8.0.43
> 被测对象：`backend`（真实接口） + `cilent`（**小程序页面代码原样运行**）
> 结论：**接口 50/50、页面 16/16、交互 17/17、预留 10/10 全部通过，后端 0 ERROR**

---

## 1. 怎么测的（不是只看接口）

小程序是原生框架，没法在命令行渲染 UI，所以用了三层验证：

| 层 | 方法 | 覆盖 |
|---|---|---|
| ① 契约层 | 直接 HTTP 请求，逐字段断言 | 52 条路由 / 50 条主用例 |
| ② 页面层 | 用 Node 模拟 `wx`/`Page`/`App` 运行时，**加载真实页面 JS**，执行 `onLoad/onShow`，检查 `data` 与 console | 16 个页面 |
| ③ 交互层 | 调用页面真实方法（`onLike`/`submit`/`sendQuestion`/`onFeedback`/`onSave`），走真实接口 | 17 个交互 |

页面层还做了两件事：
- 递归扫描 `data`，**任何 undefined 字段都算失败**（防止 WXML 绑定空白）；
- 捕获页面 `console.warn/error`，出现即失败。

SSE 用**前端自己的 `utils/sse.js`** 解析我们发出的流（含 UTF-8 跨块），不是另写一套解析器。

---

## 2. 结果

### 2.1 接口（50/50）

```text
TOTAL=50 PASS=50 FAIL=0
home 栏目4/入口6/资讯4 ｜ articles total=10 置顶优先
gov apply 缺字段→40001 ｜ 提交→SB20261114xxxx/38000分/承诺时间
apply cancel/rate ｜ request create/urge/rate ｜ pay→40004
ai chat 250字+2引用 ｜ SSE meta→delta×32→refs→done 657ms
files 返回 /static/upload/... ｜ 401/40401/40402/40001/40004 全部符合契约
```

### 2.2 页面（16/16，干净种子数据）

| 页面 | 关键校验 |
|---|---|
| 首页 | 4 栏目 / 6 入口 / 4 资讯 / 户数 486 / 页脚备案号 |
| 资讯列表、详情 | 列表非空；正文 >100 字符；上下篇 |
| 政务首页、事项详情 | 5 个分类 6 个事项；材料 3 / 表单 5 / 步骤 5 |
| 在线申报 | 动态字段 5 个、材料 3 项正确渲染 |
| 我的办件、办件详情 | 3 条种子办件；状态文案、时间轴 |
| 诉求提交/列表/详情 | 时间轴、回复 |
| 便民服务 | 黄页 8 条、招聘 4 条、奶茶会 3 场 |
| AI 网格员 | 4 条推荐问、欢迎语 |
| AI 历史 | 本地会话列表 |
| 个人中心、资料编辑 | 姓名/三级网格/网格员/统计 |

### 2.3 交互（17/17）

```text
✅ 资讯点赞        36→37，liked=true；再点 → 36
✅ 在线申报        页面填表提交 → SB20261114000x → 回查“已提交”
✅ AI 流式         客户端解析 250 字，首字“今年城乡居民医保…”，refs=2，followUps=2
✅ AI messageId    非 "pending"，反馈成功
✅ AI 反馈         点“有用” → up，toast「感谢您的反馈」
✅ 引用跳转        /pages/article/detail?id=a1001
✅ 会话落库        2 条消息可回查
✅ AI 历史页       本地会话 1 条
✅ 诉求提交        QZ202611140001 → 待受理
✅ 修改昵称        PUT /users/me 生效
```

### 2.4 预留接口（10/10）

workbench 7 条 + family 2 条 + agent 1 条 = 40004（V3 文案）；share/points = 40004（V4 文案）。

---

## 3. 调试中修掉的 3 个真问题

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 1 | `GET /ai/suggestions` 返回 401，AI 页推荐问空白 | `AiController` 类上标了 `@LoginRequired`，把公开接口也锁了 | 类注解下沉到 6 个需要登录的方法 |
| 2 | AI 点“有用”提示失败/无效 | SSE `meta.messageId` 发的是 `"pending"`，前端拿它去反馈 | 先落库助手消息，再发 meta（真实 id） |
| 3 | 重新导入种子后政务/黄页/推荐问全空 | 建表时把 `conditions` 改成 `conditions_json`，生成器仍在插入旧列名，SQL 中断 | 生成器改列名，重跑 `gen-seed.cjs` |

> 第 3 个问题很典型：SQL 中断后前半段已提交，表现为“首页有数据、政务全空”，只测接口不看数据就会漏。

---

## 4. 复跑

```powershell
cd backend
# 复位种子 + 四组测试
powershell -File tests\run-all.ps1
```

或分开跑：

```powershell
Get-Content -Raw -Encoding UTF8 ..\db\seed.sql | mysql -uroot -p123456 xinyuan_village
node tests\api-test.mjs
node tests\frontend-sim.mjs
node tests\interaction-test.mjs
node tests\reserved-test.mjs
```

---

## 5. 没覆盖到的（需要真机/人眼）

| 项 | 说明 |
|---|---|
| 视觉像素 | 没渲染 WXML，配色、间距、图标要真机确认 |
| 微信 API | `wx.chooseMedia`、`wx.requestPayment`、真实 `wx.login` 未在 DevTools 跑 |
| 真机网络 | 局域网 IP、HTTP 明文、iOS/Android 差异 |
| 支付 | 契约里就是 `40004`，未接商户号 |

建议：开发者工具导入 `cilent` → 编译 → 依次点首页 / 资讯 / 政务 / 申报 / 诉求 / AI / 我的，重点看 AI 逐字输出与办件时间轴。

---

## 6. 2026-11-15 更新（吉林数据 / 双登录）

对应前端 `f718d3b feat(miniprogram): 吉林数据、双登录、AI登录拦截、头像优化`。

| 项 | 结果 |
|---|---|
| 数据口径 | 新疆新源县 → **吉林永吉县 · 口前镇新源村**（`regionId=22022110001`，热线 0432-64216888，吉ICP） |
| 新增接口 | `POST /auth/password-login`（BCrypt，错误码 20003，失败 5 次锁 10 分钟） |
| 演示账号 | `13843216621 / 123456` |
| 游客态 | 首页/资讯/政务/便民 200；AI/办件/诉求 401 |
| 回归 | 接口 50/50、页面 16/16、交互 17/17、预留 10/10、密码登录 3/3 |

本轮同时修复：AI 回答中的 9 处新疆地名/电话；办件详情 WXML 的 `.join()` 不支持（改为 `missingText`）；`run-all.ps1` 在 Windows PowerShell 下按 GBK 传 SQL 导致中文损坏。

---

## 7. V2.1.0（2026-11-15）大模型 + RAG

| 项 | 结果 |
|---|---|
| 检索（echo 假模型） | 医保/高龄/独生子女各召回 2 条相关引用；天气类 0 条（正确拒答） |
| 流式 | `meta→delta→refs→done`，35 个 delta，约 630ms |
| 落库 | assistant 消息回填内容、refs、followUps；反馈可用真实 messageId |
| 降级 | `AI_ENABLED=false` 时全部回归通过：接口 50/50、页面 16/16、交互 17/17、预留 10/10 |
| 脚本 | `tests/ai-rag-test.ps1`（自动起 echo 实例，无需 API key） |
| 真实 DeepSeek | 医保/高龄/独生子女回答正确且带引用；小卖部/天气 0 引用拒答；流式首字 0.8–1.1s |
