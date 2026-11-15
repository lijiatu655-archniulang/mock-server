# 新源村情通 · 后端 V3（严格对齐 `cilent` 前端契约 v1）

> Spring Boot 3.2.12 / JDK 17 / MyBatis / MySQL 8 ｜ 无管理端（按你的要求）
> 数据源唯一真相：`cilent/mock/data.js`；接口唯一真相：`temp/接口契约-v1.md`
> 当前版本：**V3.0.0**（2026-11，吉林数据 + 双登录）
> 本机实测：**53 条契约路由全部实现，50 条主用例 + 10 条预留接口 + 密码登录 3 条全部通过**

---


---

---

## 0. 队友怎么跑（只需 JDK 17 + MySQL 8，不用装 Maven）

> 仓库自带 Maven Wrapper（`mvnw`），首次会自动下载 Maven 3.9.9。

**1. 环境检查**

```powershell
java -version        # 需要 17.x
Get-Service MySQL80  # 需要 Running
```

**2. 拉代码**

```powershell
git pull
cd backend
```

**3. 建库 + 导数据 + 启动（用自己的 MySQL 密码）**

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1 -DbPassword "你的MySQL密码" -InitDb
```

它会依次：建 `xinyuan_village` 库 → 导入 `schema.sql` / `seed.sql` → 没 jar 就打包 → 启动 8080。

**4. 验证**

浏览器打开：

- `http://127.0.0.1:8080/api/v1/home` → 首页 JSON
- `http://127.0.0.1:8080/api/v1/gov/items/YB001` → 事项详情

**5. 小程序指过来**

`cilent/utils/config.js`：

```js
USE_MOCK: false,
BASE_URL: 'http://127.0.0.1:8080/api/v1',   // 真机换成电脑局域网 IP
```

开发者工具「详情 → 本地设置」勾选 **不校验合法域名**。

### 不用脚本的手动版

```powershell
.\mvnw.cmd -DskipTests package
java -jar target\village-server-3.0.0.jar --server.port=8080
```

### 常见报错

| 报错 | 原因 | 处理 |
|---|---|---|
| `Access denied for user 'root'` | 密码不对 | `-DbPassword` 换成自己的 |
| `Communications link failure` | MySQL 没启动 / 端口不是 3306 | 启动服务，或加 `--spring.datasource.url=...` |
| `Port 8080 was already in use` | 端口被占 | `-Port 8081` 或 `--server.port=8081` |
| `'java' 不是内部或外部命令` | 没装 JDK / 没配 PATH | 装 JDK 17 并设 `JAVA_HOME` |
| `禁止运行脚本` | PowerShell 执行策略 | 用 `powershell -ExecutionPolicy Bypass -File .\run.ps1 ...` |

## 1. 三分钟启动

```powershell
# ① 建库 + 导入种子数据（脚本从 cilent/mock/data.js 自动生成）
Get-Content -Raw -Encoding UTF8 ..\db\schema.sql | mysql -uroot -p123456
Get-Content -Raw -Encoding UTF8 ..\db\seed.sql   | mysql -uroot -p123456 xinyuan_village

# ② 打包并启动（端口 8080，绑定 0.0.0.0 便于真机）
mvn -DskipTests package
java -jar target\village-server-3.0.0.jar
```

健康检查：

```bash
curl -X POST http://127.0.0.1:8080/api/v1/auth/mock-login \
  -H "Content-Type: application/json" -H "X-Client: wx-miniprogram" -d '{"regionId":"65402510001"}'
```

数据库连接可用 `DB_USER` / `DB_PASSWORD` 覆盖，JWT 密钥用 `JWT_SECRET`。

演示账号（账号密码登录页已提示）：

| 方式 | 账号 | 密码 |
|---|---|---|
| 账号密码 | `13843216621` | `123456` |
| 微信登录 | 任意（无 appid 时用种子用户兜底） | — |

> 2026-11 起种子数据为**吉林省永吉县 · 口前镇新源村**（`regionId=22022110001`），
> 热线 `0432-64216888`，备案号 `吉ICP备2026001234号-1`。

---

## 2. 前端怎么切过来（两行）

`cilent/utils/config.js`：

```js
USE_MOCK: false,                              // 原来 true
BASE_URL: 'http://127.0.0.1:8080/api/v1',     // 原来是 :3000
```

微信开发者工具「详情 → 本地设置」勾选 **不校验合法域名** 即可，真机把 `127.0.0.1` 换成电脑局域网 IP。

---

## 3. 已实现接口（53 / 53）

| 分组 | 数量 | 说明 |
|---|---:|---|
| 认证 | 4 | wx-login（无 appid 时用种子用户兜底）、mock-login、**password-login（手机号+密码，BCrypt）**、logout（JWT 黑名单） |
| 首页与内容 | 8 | home 聚合、columns、articles 列表/详情/点赞、modules、app/config、regions/tree、dicts |
| 政务只读 | 3 | categories、items（分类/关键词）、items/{code}（条件/材料/步骤/动态表单/FAQ） |
| 政务申报 | 6 | 提交（必填字段 + 材料缺失校验）、我的办件、详情+时间轴、撤销、评价、pay 返回 40004 |
| 诉求工单 | 5 | 提交、列表、详情、评价、催办 |
| 便民服务 | 3 | directory、jobs、tea-meetings |
| AI 网格员 | 7 | suggestions、chat、chat/stream（SSE）、feedback、会话列表/消息/删除 |
| 用户 | 2 | users/me（含三级网格、网格员、stats）、users/me 修改 |
| 系统 | 2 | events 埋点、files 上传（落盘 + 返回绝对 URL） |
| 预留 | 13 | V3 工作台 7 + 家庭成员 2 + Agent 1、V4 分享/积分 2，统一 `40004` |

SSE 事件与契约一致：`meta → delta × N → refs → done`，异常 `error`；`delta.text` 按 8 字切分，中文不会被截断。

---

## 4. 实测结果（2026-11-14）

```text
TOTAL=50 PASS=50 FAIL=0
home            栏目4 / 入口6 / 资讯4 / 户数486       11ms
article detail  正文含“380” / 浏览+1 / 上下篇          12ms
gov apply       校验 4 个缺失字段 → 40001              5ms
gov apply create SB202611140001 / 38000 分 / 承诺 11-16 15ms
apply cancel    已撤销                                 18ms
apply rate      5 星 → hasRated=true                   20ms
pay             40004（V2.1 开放）                       3ms
request create  QZ202611140001 / 待受理                 20ms
request urge    第 1 次催办                              18ms
ai chat         250 字回答 + 2 条引用                    31ms
ai stream       meta→delta→refs→done，delta=32，657ms
files           返回 /static/upload/20261114/xxx.png    14ms
未登录           401 / 20001；文章不存在 40401；事项不存在 40402
预留接口         10/10 返回 40004（V3/V4 文案区分）
```

复跑：

```powershell
# 先复位数据（测试会写数据），再跑
Get-Content -Raw -Encoding UTF8 ..\db\seed.sql | mysql -uroot -p123456 xinyuan_village
node tests\api-test.mjs
node tests\reserved-test.mjs
```

---

## 5. 工程结构

```text
backend/src/main/java/com/xinyuan/village/
├── common/   Result、ErrorCode（契约错误码）、异常、JWT、拦截器、traceId、内存缓存
├── config/   Jackson 时间格式、AI 线程池
└── modules/
    ├── auth/       登录 / 登出
    ├── user/       资料 + 三级网格 + stats + 网格员
    ├── system/     配置 / 入口 / 区域树 / 字典 / 埋点 / 上传
    ├── content/    栏目 / 资讯 / 点赞
    ├── home/       首页聚合
    ├── gov/        事项、申报、时间轴、评价
    ├── request/    诉求 / 咨询 / 建议
    ├── service/    黄页 / 招聘 / 奶茶会
    ├── ai/         规则引擎（与 mock/ai.js 一致）+ SSE + 会话
    └── reserved/   V3/V4 统一 40004
```

---

## 6. 几个关键实现说明

| 点 | 做法 | 原因 |
|---|---|---|
| 种子数据 | `db/gen-seed.cjs` 直接 require `cilent/mock/data.js` 生成 SQL | 前端改了 mock 数据，重跑一条命令即可同步，不会两边不一致 |
| 金额 | `gov_apply.amount` 存**分**，医保 38000 | 契约要求 V2 支付统一用分，前端按 `/100` 展示 |
| 办件号 | `SB + yyyyMMdd + 4 位序列`，按当日数量自增 | 与契约一致 |
| 承诺时间 | `Times.addWorkdays(promiseDays)`，跳过周末，落在 19:30 | 契约要求跳过周末/节假日（节假日表后续可加） |
| 鉴权 | 默认公开，`@LoginRequired` 收紧；有 token 一律解析 | 支持「游客可看、登录可赞/可办」 |
| AI | 规则引擎与 `mock/ai.js` 完全一致，先事项、再知识、查不到直说 | 断网/无 key 也能稳定演示，回答带引用 |
| SSE | `SseEmitter` + `X-Accel-Buffering: no`，8 字/18ms | 前端逐字渲染，中文不裂 |
| 缓存 | 内存 `CacheStore`（token 黑名单、配额可扩展） | 演示环境不依赖 Redis |

---

## 6.1 AI：大模型 + RAG（2026-11-15）

**链路**：问题 → RAG 召回（文章 + 政务事项）→ Prompt（资料 + 最近 3 轮历史）→ 大模型 → SSE 逐字 → 结束回填引用/追问。
未配置 key、调用失败或在首字前失败时，**自动回退规则引擎**，保证任何环境都有回答。

```bash
# 启用真实模型（示例：通义兼容模式）
AI_ENABLED=true AI_API_KEY=sk-xxx AI_MODEL=qwen-plus \
  java -jar target\village-server-3.0.0.jar
```

| 配置 | 默认 | 说明 |
|---|---|---|
| `AI_ENABLED` | false | 总开关；false 时纯规则引擎 |
| `AI_PROVIDER` | openai | `openai` 兼容协议；`echo` 本地假模型（仅联调） |
| `AI_API_KEY` | 空 | 为空时视为未启用 |
| `AI_MODEL` | qwen-plus | 模型名 |
| `AI_BASE_URL` | DashScope 兼容地址 | 可换 DeepSeek/自建网关 |

**RAG 实现**（`modules/ai/rag`，2026-11 调优）：

- 多主题问题按“和/与/、/，”拆子问题，每类各取前 2 条，保证两类资料都进上下文；
- 拒答判定只看开头 60 字，部分拒答不会清空已检索到的引用；


- 语料：`cms_article` 正文（去 HTML、按句切 260 字）+ `gov_item` 事项（条件/材料/流程/FAQ 拍平）；
- 索引：首次检索时在内存构建，几十个 chunk，无向量库依赖；
- 检索：BM25（中文单字 + 二元组、停用词、覆盖率 ≥ 0.3、与 Top1 相对分 ≥ 0.65）；
- 引用：`refs` 带 `route`，前端点击直达文章/事项详情。

**流式**：先插入空 assistant 消息拿真实 `messageId` → `meta` → `delta` → 结束后回填内容/引用/追问 → `refs` → `done`。协议与契约完全一致。

**真实模型实测（DeepSeek / deepseek-chat，2026-11-15）**：

| 问题 | 耗时 | 结果 |
|---|---|---|
| 医保怎么缴 | ~1.9s | 380 元、集中缴费期、3 种缴费方式，带 2 条引用 |
| 高龄补贴怎么申请 | ~1.1–1.7s | 条件/材料/流程/时限完整，带 2 条引用 |
| 独生子女证需要什么材料 | ~1.2–1.4s | 5 项材料 + 5 个工作日，带 2 条引用 |
| 想开小卖部要办什么手续 | ~1.0–1.5s | 正确拒答，0 引用 |
| 今天天气怎么样 | ~1.1–1.5s | 正确拒答，0 引用 |
| 流式「养老保险交多少年」 | 首字 0.8–1.1s / 总 1.4–1.6s | 15 年 + 引用 |

启动时直接带 key（不落盘，只进进程环境变量）：

```powershell
.\run.ps1 -DbPassword "你的MySQL密码" -AiKey "sk-你的key" -AiModel deepseek-chat
# 或手动：$env:AI_ENABLED="true"; $env:AI_API_KEY="sk-..."; $env:AI_MODEL="deepseek-chat"
```

**实测（echo 假模型）**：

| 问题 | 召回 |
|---|---|
| 医保怎么缴 | 缴费通知 + 医保参保缴费事项 |
| 高龄补贴怎么申请 | 高龄津贴事项 + 11 月值班（含高龄年审） |
| 独生子女证要什么材料 | 光荣证核发 + 办理须知 |
| 今天天气怎么样 | 0 条（正确拒答） |

## 7. 边界（与契约一致）

- **没有 `/admin/*`**：按你的要求不提供；办件状态演示由种子数据推进。
- `/gov/applies/{id}/pay` 返回 `40004`（V2.1 支付未接）。
- V3 工作台/家庭成员/Agent、V4 分享/积分：路径已冻结，统一 `40004`。
- 文件上传落本地磁盘，返回 `http://127.0.0.1:8080/static/upload/...`；换域名只改 `sys_config.fileBaseUrl`。

---

## 8. 本地打开小程序（已帮你切好接口）

`cilent/utils/config.js` 已改为：

```js
USE_MOCK: false,
BASE_URL: 'http://127.0.0.1:8080/api/v1',
```

回滚：`git checkout -- cilent/utils/config.js`。

**打开步骤**

1. 微信开发者工具 → 导入项目 → 目录选 `D:\Dsh house\projects\mock-server\cilent`；
2. AppID 用项目里自带的 `wx2bfc9ee3e046f12e`（或你自己的测试号）；
3. `project.private.config.json` 里 `urlCheck` 已是 `false`，无需再配域名；
4. 编译后首页会请求 `http://127.0.0.1:8080/api/v1/home`，后端日志能看到 `GET /api/v1/home`。

> 本机 DevTools 装在 `D:\Program Files\微信web开发者工具`，但**服务端口未开启**，所以命令行 `cli.bat open` 被拒。
> 直接用界面导入即可；若要命令行自动化，需在「设置 → 安全设置」打开服务端口。

**登录说明**：`USE_MOCK=false` 时小程序走 `wx.login → POST /auth/wx-login`。
后端在没有配置 appid 的情况下会用种子用户「王秀兰」兜底，所以没配 `WX_APP_ID` 也能登录成功。

**浏览器快速自检**（不用打开 DevTools）：

| 地址 | 看到什么 |
|---|---|
| `http://127.0.0.1:8080/api/v1/home` | 首页完整 JSON |
| `http://127.0.0.1:8080/api/v1/gov/items/YB001` | 医保事项 + 材料 + 动态表单 |
| `http://127.0.0.1:8080/api/v1/ai/suggestions` | AI 推荐问 |

---

## 9. 演示数据复位

联调过程中会产生办件/诉求/会话，回到干净种子数据：

```powershell
Get-Content -Raw -Encoding UTF8 ..\db\seed.sql | mysql -uroot -p123456 xinyuan_village
```

> `seed.sql` 会 TRUNCATE 业务表再插入，AI 会话也会清空。
