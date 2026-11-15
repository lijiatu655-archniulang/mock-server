# 新源村情通 · 小程序端

一个“村务公开 + 政务办事 + 诉求建议 + AI 网格员”的微信小程序。红色政务视觉，贴合村级真实场景。

## 版本

当前版本：**V3.0.0**（详见仓库根目录 `CHANGELOG.md`）

## 快速开始

1. 微信开发者工具 → 导入项目 → 选择本目录 `cilent`；
2. 编译。当前 `USE_MOCK = false`，连本机 Spring Boot 后端 `http://127.0.0.1:8080/api/v1`；
3. 若后端未启动、想离线演示，把 `utils/config.js` 改回 `USE_MOCK: true` / `BASE_URL: 'http://127.0.0.1:3000/api/v1'`，再启动 `temp/mock-server`；
4. 若提示域名校验，确认 `project.private.config.json` 中 `urlCheck` 为 `false`（已配置）。

AppID 沿用项目里的 `wx2bfc9ee3e046f12e`，如需换成自己的，改 `project.config.json`。

## 接口切换

```js
// utils/config.js
USE_MOCK: false  // 走真实 Spring Boot 后端
BASE_URL: 'http://127.0.0.1:8080/api/v1'

USE_MOCK: true   // 内置 Mock，断网演示
BASE_URL: 'http://127.0.0.1:3000/api/v1'
```

真实后端启动与联调见 `../backend/README.md`，字段契约见 `../temp/接口契约-v1.md`，接口总表见 `../temp/接口总表.md`。

## 目录

```text
api/           按业务模块拆分的接口层
  auth.js      登录/退出
  home.js      首页聚合/栏目/九宫格
  content.js   资讯列表/详情/点赞
  gov.js       政务分类/事项/在线申报/我的办件
  request.js   诉求/咨询/建议/催办/评价
  service.js   服务黄页/就业招聘/奶茶会
  ai.js        AI 推荐问/流式/同步/反馈/历史会话
  user.js      我的资料/区域树/字典
  system.js    应用配置/埋点
  reserved.js  V3/V4 预留接口（工作台/家庭成员/Agent/积分）

mock/          内置 Mock（与接口契约字段一致）
  data.js      资讯/事项/办件/诉求/黄页/招聘/奶茶会
  ai.js        意图识别 → 政策回答 + 引用依据
  index.js     契约路由

utils/
  request.js   统一 Result 解析、token、错误码
  sse.js       wx.request(enableChunked) 的 SSE 解析（UTF-8/粘包）
  config.js    前后端分离开关
  storage.js   本地 token/点赞/AI 历史/待提问
  upload.js    文件上传（Mock 本地路径 / 真实 wx.uploadFile）
  format.js    日期/手机号/数字格式化

pages/
  index/                  首页
  article/list|detail     资讯
  gov/index|detail        政务首页/事项指南
  gov/apply               在线申报
  gov/applies             我的办件
  gov/apply-detail        办件详情/时间轴/评价
  request/create|list|detail  诉求提交/我的诉求/详情
  service/index           服务黄页 + 招聘 + 奶茶会
  ai/ai|history           AI 网格员 / 历史会话
  profile/profile|edit    个人中心 / 修改资料
```

## 已实现功能

- 首页：红底头部、村名/网格、通知条、4 栏目、医保横幅、资讯流、6 宫格、合规页脚；
- 资讯：列表筛选/分页/置顶，详情富文本、点赞、上下篇；
- 政务：4 类 6 项事项；在线申报（动态表单、材料、缺项提示）、我的办件、时间轴、撤销、评价；
- 诉求：咨询/诉求/建议提交、我的诉求、详情、催办、评价；
- 便民：服务黄页一键拨号、就业招聘、线上奶茶会报名；
- AI 小贾：推荐问、逐字流式、停止、引用、赞踩、追问、历史会话、继续对话、重新生成；
- 我的：实名身份、三级网格、网格员电话、头像/昵称修改、我的办件/诉求入口、登录/退出；
- 登录：未登录时可游客浏览首页/资讯；AI 小贾强制登录，未登录会显示登录引导；个人中心支持「微信一键登录」和「手机号 + 密码」两种方式；账号密码走 `POST /auth/password-login`（后端按契约实现）。

## 边界

- **管理端 `/admin/*` 已删除**，按你的要求不预留；
- 微信支付未接，`/gov/applies/{id}/pay` 返回 40004，演示用线下代收/种子状态；
- V3 网格员工作台、家庭成员、AI Agent 仍预留；
- 金额、时限、电话均为演示样例，上线前由村委/县政务平台核定；
- 演示版已移除备案号、主办单位、举报电话等合规页脚，避免使用未备案信息；
- 图标全部本地 PNG，由 `temp/tools/gen_icons.py` 生成；AI 支持大模型 + RAG，未配置 key 时自动回退规则引擎。
