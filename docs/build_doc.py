# -*- coding: utf-8 -*-
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = r"D:\Dsh house\projects\mock-server\docs\比赛材料"
os.makedirs(OUT, exist_ok=True)

doc = Document()

# 页面设置
sec = doc.sections[0]
sec.page_width = Cm(21.0)
sec.page_height = Cm(29.7)
sec.left_margin = Cm(2.2)
sec.right_margin = Cm(2.2)
sec.top_margin = Cm(2.0)
sec.bottom_margin = Cm(2.0)

def set_run_font(run, name="宋体", size=10.5, bold=False, color=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)

def style_font(style, name, size, bold=False):
    style.font.name = name
    style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    style.font.size = Pt(size)
    style.font.bold = bold

style_font(doc.styles["Normal"], "宋体", 10.5)
for i, (sz, nm) in enumerate([(16, "微软雅黑"), (13, "微软雅黑"), (11.5, "微软雅黑")], start=1):
    style_font(doc.styles["Heading %d" % i], nm, sz, True)

PENDING = {"break": False}

def h(text, level=1, space_before=10, space_after=6):
    p = doc.add_heading(text, level=level)
    if PENDING["break"]:
        p.paragraph_format.page_break_before = True
        PENDING["break"] = False
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    for r in p.runs:
        r.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    return p

def para(text="", size=10.5, bold=False, align=None, space_after=4, first_indent=True, color=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.4
    if first_indent:
        p.paragraph_format.first_line_indent = Pt(21)
    if align == "center":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "right":
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run(text)
    set_run_font(r, "宋体", size, bold, color)
    return p

def bullet(text, size=10.5):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.35
    set_run_font(p.add_run(text), "宋体", size)

def num(text, size=10.5):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.35
    set_run_font(p.add_run(text), "宋体", size)

def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)

def no_split(tbl):
    for row in tbl.rows:
        trPr = row._tr.get_or_add_trPr()
        trPr.append(OxmlElement("w:cantSplit"))

def table(headers, rows, widths=None, size=9.5, header_fill="EAF1FB"):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, htext in enumerate(headers):
        hdr[i].text = ""
        p = hdr[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_run_font(p.add_run(str(htext)), "微软雅黑", size, True)
        shade(hdr[i], header_fill)
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            p.paragraph_format.line_spacing = 1.2
            set_run_font(p.add_run(str(val)), "宋体", size)
    if widths:
        for i, w in enumerate(widths):
            for r in t.rows:
                r.cells[i].width = Cm(w)
    no_split(t)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

def code(text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.4)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.05
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), "F4F5F7")
    pPr.append(shd)
    r = p.add_run(text)
    set_run_font(r, "Consolas", 8.8)
    r.font.color.rgb = RGBColor(0x2B, 0x2B, 0x2B)

def shot(title):
    t = doc.add_table(rows=1, cols=1)
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]
    c.width = Cm(16.4)
    c.text = ""
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(26)
    p.paragraph_format.space_after = Pt(26)
    set_run_font(p.add_run("【截图位】" + title + "（粘贴小程序截图）"), "宋体", 10, False, (0x88, 0x88, 0x88))
    shade(c, "FAFAFA")
    no_split(t)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def page_break():
    PENDING["break"] = True

# ============ 封面 ============
for _ in range(3):
    doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_run_font(p.add_run("第九届传智杯全国大学生数智创新与 AI 应用大赛"), "微软雅黑", 15, True)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_run_font(p.add_run("AI 微信小程序开发挑战赛 · 作品说明"), "微软雅黑", 13, False, (0x55, 0x55, 0x55))
doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_run_font(p.add_run("新源村情通"), "微软雅黑", 30, True, (0xC4, 0x16, 0x1C))
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_run_font(p.add_run("村级事务与 AI 网格员一体化服务平台"), "微软雅黑", 12, False, (0x44, 0x44, 0x44))
for _ in range(5):
    doc.add_paragraph()
info = [
    ("作品名称", "新源村情通"),
    ("参赛赛道", "AI 微信小程序开发挑战赛"),
    ("参赛团队", "______________________________"),
    ("所在学校", "______________________________"),
    ("团队成员", "______________________________"),
    ("指导教师", "______________________________"),
    ("提交日期", "2026 年 11 月"),
]
for k, v in info:
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    set_run_font(p.add_run(k + "：" ), "微软雅黑", 10.5, True)
    set_run_font(p.add_run(v), "宋体", 10.5)
page_break()

# ============ 摘要 ============
h("摘 要", 1)
para("“新源村情通”是面向吉林省永吉县口前镇新源村的村级事务服务平台，以微信小程序为载体，"
     "把村务公开、政务办事、诉求建议、便民服务和 AI 网格员整合到一个入口。项目从 2025 年 11 月立项，"
     "经历 V1（内容与办事指南）、V2（在线申报、诉求、AI 问答）、V3（管理端工作台、家庭、双角色登录）三个版本迭代。")
para("技术上是“小程序 + Spring Boot + MySQL”的前后端分离架构：小程序 19 个页面，后端 64 条接口、29 张表，"
     "统一 Result 响应、JWT 鉴权、SSE 流式问答；AI 采用“DeepSeek 大模型 + RAG 检索 + 规则引擎兜底”的三级链路，"
     "回答附带可点击的政策/事项引用，断网或无密钥时自动降级，保证演示稳定。")
para("项目已实现居民与管理员双角色闭环：居民在线申报、提交诉求、查看进度、评价；管理员发布通知、受理诉求、"
     "回复办结、查看户籍统计；家庭成员可维护。配套 60+ 条自动化用例，接口、页面、交互回归全部通过。")
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(8)
set_run_font(p.add_run("关键词："), "微软雅黑", 10.5, True)
set_run_font(p.add_run("村级事务；微信小程序；大模型；RAG；SSE；数字乡村"), "宋体", 10.5)
page_break()

# ============ 目录 ============
h("目 录", 1)
toc = [
    "一、项目说明",
    "二、小程序与 AI 能力说明",
    "三、创新点说明",
    "四、技术实现",
    "五、成果展示",
    "六、历史说明",
    "七、落地规划",
    "附录 A  接口总表（摘要）",
    "附录 B  演示视频脚本（3 分钟）",
    "附录 C  提交材料清单",
]
for item in toc:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Cm(1.0)
    set_run_font(p.add_run(item), "宋体", 11)
page_break()

# ============ 一、项目说明 ============
h("一、项目说明", 1)
h("1.1 背景与问题", 2)
para("村级事务看起来琐碎，实际存在三个长期痛点：一是政策信息分散在公示栏、微信群、口头通知里，村民“找不到、看不懂”；"
     "二是医保缴费、高龄补贴、独生子女证等事项需要往返村部，材料经常带不全；三是诉求提交后缺少进度反馈，"
     "“提了没人管”直接影响信任。")
para("与此同时，村干部人手有限，重复解释政策、手工登记诉求、统计户籍占用了大量时间。项目希望用一个小程序，"
     "把“村民问—干部答—事项办—结果评”的闭环搬到线上，并让 AI 承担高频、重复的政策咨询。")

h("1.2 目标用户", 2)
table(["用户", "特征", "核心诉求"], [
    ["本村村民", "中老年为主，智能手机使用不熟练", "政策看得懂、事项办得成、诉求有回音"],
    ["外出务工村民", "不在村，信息滞后", "远程了解村务、帮家人代办"],
    ["村干部 / 网格员", "人手少、事务杂", "少重复解释、诉求不漏办、户籍数据可查"],
], widths=[4.0, 5.5, 6.5])

h("1.3 核心功能", 2)
table(["模块", "功能", "版本"], [
    ["村情资讯", "通知条、轮播、三务公开/政策解读/村务动态分栏、详情、点赞、上下篇", "V1"],
    ["政务办事", "事项分类、办事指南、动态表单、材料清单、在线申报、办件进度、撤销、评价", "V1/V2"],
    ["诉求建议", "咨询/诉求/建议提交、图片上传、我的诉求、进度时间轴、催办、评价", "V2"],
    ["AI 网格员", "推荐问、流式回答、引用跳转、赞踩、追问、历史会话、多轮上下文", "V2/V3"],
    ["便民服务", "服务黄页一键拨号、就业招聘、线上奶茶会报名", "V1"],
    ["个人中心", "微信/账号双登录、实名信息、三级网格、头像昵称、我的办件/诉求", "V1/V2"],
    ["管理端", "工作台概览、通知发布、诉求受理/回复/办结、户籍统计", "V3"],
    ["家庭", "家庭成员增删改查、代办基础", "V3"],
], widths=[3.2, 10.6, 2.2])

h("1.4 使用场景与核心流程", 2)
para("居民侧：打开小程序 → 首页看通知/资讯 → 需要办事时进入“政务管理”选事项 → 填表、上传材料、提交 → "
     "在“我的办件”看进度、补正、评价；有意见时进入“诉求建议”提交 → 查看时间轴与回复 → 评价。", first_indent=True)
para("管理员侧：登录时选择“管理员” → 工作台看概览 → 发布通知（居民首页通知条即时可见）→ "
     "在诉求列表受理、回复、办结（居民端时间轴同步更新）→ 在户籍统计查看网格/性别/年龄段分布。", first_indent=True)
para("AI 侧：任意政策问题 → 后端检索文章与事项 → 大模型生成回答并附引用 → 前端逐字展示 → 可点引用跳转、赞踩、追问。", first_indent=True)

h("1.5 演示入口与账号", 2)
table(["角色", "账号", "密码", "入口"], [
    ["居民", "13843216621", "123456", "微信登录或账号密码"],
    ["管理员", "13843219072", "123456", "账号密码（选择“管理员”）"],
], widths=[3.0, 5.0, 3.5, 4.5])
para("演示环境：微信开发者工具导入 cilent 目录；后端 http://127.0.0.1:8080；离线演示可把 USE_MOCK 改为 true。", size=9.5)
page_break()

# ============ 二、能力说明 ============
h("二、小程序与 AI 能力说明", 1)
h("2.1 微信小程序能力", 2)
table(["能力", "使用位置", "说明", "状态"], [
    ["wx.login + code2Session", "登录", "无 appid 时用种子用户兜底，配置 appid 后可换真实 openid", "已用"],
    ["账号密码登录", "登录", "手机号 + BCrypt 密码，居民/管理员双角色", "已用"],
    ["头像昵称", "个人中心", "chooseAvatar + nickname 输入", "已用"],
    ["图片选择 / 预览", "诉求、申报", "wx.chooseMedia、previewImage", "已用"],
    ["文件上传", "材料/头像", "wx.uploadFile → 后端 /files", "已用"],
    ["分享", "资讯/首页", "open-type=share、onShareAppMessage", "已用"],
    ["拨打电话", "黄页/网格员", "wx.makePhoneCall", "已用"],
    ["剪贴板", "办件号/联系方式", "wx.setClipboardData", "已用"],
    ["SSE 流式", "AI 问答", "enableChunked + onChunkReceived 解析事件流", "已用"],
    ["微信支付", "在线缴费", "契约返回 40004，演示走线下代收", "未用"],
    ["订阅消息", "办件/诉求提醒", "规划中（需模板申请）", "未用"],
    ["地图 / 定位", "诉求地点", "规划中（chooseLocation）", "未用"],
    ["OCR / 语音", "身份证、语音提问", "规划中", "未用"],
], widths=[4.4, 3.6, 6.6, 1.8])

h("2.2 云开发与后端能力", 2)
para("项目未使用微信云开发，采用自建 Spring Boot 后端：一是需要与既有 MySQL 村务数据打通；"
     "二是 AI 需要服务端保管密钥、做 RAG 检索与流式转发，密钥不能下发到小程序；"
     "三是自建后端便于后续部署到镇/县政务云。小程序通过 HTTPS/HTTP 调用 /api/v1 接口。")
table(["服务端能力", "实现"], [
    ["统一响应", "Result{code,message,data,traceId,timestamp}；业务错误 HTTP 200，鉴权 401/403"],
    ["鉴权", "JWT + 登出黑名单；@LoginRequired / @AdminRequired；游客可读公开内容"],
    ["流式问答", "SseEmitter，事件 meta→delta→refs→done"],
    ["文件", "本地存储 + /static/upload 映射，限制 10MB"],
    ["数据", "MySQL 8，29 张表，种子数据由脚本从 data.js 生成"],
], widths=[4.0, 12.0])

h("2.3 AI 能力", 2)
para("AI 采用“大模型优先、RAG 增强、规则兜底”的三级链路，核心不是简单套一个聊天框，而是让回答“有依据、可追溯、可降级”。")
table(["能力", "实现方式"], [
    ["大模型", "DeepSeek（OpenAI 兼容协议），支持同步与 SSE 流式；模型名可配置"],
    ["RAG 检索", "文章正文 + 政务事项构建语料；中文单字+二元组 BM25；多主题按子问题拆分召回"],
    ["引用", "每条回答返回 refs（文章/事项标题、摘要、可点击 route），前端展示并可跳转"],
    ["拒答", "资料未覆盖时明确说“没查到”，不编造金额/时限/材料；拒答时清空不相关引用"],
    ["多轮", "携带最近 3 轮历史，支持“那要带什么材料”这类追问"],
    ["降级", "未配置密钥、调用失败或首字前失败 → 自动回退规则引擎，演示不中断"],
    ["安全", "密钥只放服务端环境变量 / 本地 .env（已 gitignore），不进仓库、不下发小程序"],
], widths=[3.0, 13.0])

h("2.4 能力边界", 2)
para("当前未接入微信支付、订阅消息、地图、OCR、语音识别；这些已在 V4 路线中规划。"
     "项目坚持“写进文档的能力必须真实可演示”，不使用未实现能力充当亮点。")
page_break()

# ============ 三、创新点 ============
h("三、创新点说明", 1)
h("3.1 AI 应用创新：村务垂直 RAG + 可追溯引用", 2)
para("通用大模型不知道“本村今年医保缴多少、高龄补贴要几张照片”。项目把本村文章与政务事项做成轻量语料库，"
     "检索后拼进提示词，回答必须带“（依据：xxx）”，前端引用可点击跳转。资料没有覆盖时模型明确拒答，"
     "避免“编政策”。这套方案不依赖向量数据库，几十个 chunk 内存检索即可，部署成本低。")
h("3.2 场景创新：双角色闭环 + 家庭代办", 2)
para("很多参赛作品只做“村民端展示”。本项目把管理员纳入同一小程序：居民提交诉求 → 管理员受理 → 回复 → 办结 → 居民评价，"
     "时间轴双方可见；同时开放家庭功能，为“帮老人代办”打基础。")
h("3.3 产品创新：单村试点、可复制到镇县", 2)
para("区域、村情、事项、资讯、通知均由数据驱动，换一个村只需替换 regionId 与种子数据；"
     "同一套后端可支撑多村，适合“一村试点—全镇推广—县域平台”的路径。")
h("3.4 技术创新：轻量 RAG + 三级降级 + 契约先行", 2)
para("RAG 采用 BM25（中文单字+二元组、停用词、覆盖率与相对分过滤），无外部依赖；"
     "AI 链路设计为“模型→规则”自动降级，断网也能演示；前后端以契约文档冻结字段与错误码，"
     "接口 64 条、自动化用例 60+，改动能快速回归。")
h("3.5 商业模式创新：SaaS + 运营服务", 2)
para("对村集体按年收取平台服务费（含部署、数据初始化、培训），对镇/县提供多村版本与数据看板；"
     "后续可叠加代办、招聘、助农等增值服务，形成“平台费 + 运营服务费”的组合。")
h("3.6 用户体验创新：适老化与可信感", 2)
para("红色政务视觉、大字号、关键信息分点；AI 回答先给结论再给做法，引用可点；"
     "办件号、承诺时间、时间轴让“办事有回音”；管理员端一屏看概览，减少重复操作。")
page_break()

# ============ 四、技术实现 ============
h("四、技术实现", 1)
h("4.1 总体架构", 2)
para("系统分为三层：小程序端（19 页）— 后端 API（Spring Boot 3.2 / JDK 17 / MyBatis / MySQL 8）— 外部 AI（DeepSeek）。", first_indent=True)
code("""┌──────────────────────────── 微信小程序（cilent） ────────────────────────────┐
│  首页 / 资讯 / 政务 / 诉求 / 便民 / AI / 家庭 / 管理端 / 个人中心（19 页）      │
│  utils/request.js（Result 解析、token、错误码）  utils/sse.js（事件流解析）    │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ HTTP / SSE  (/api/v1)
┌───────────────────────────────▼──────────────────────────────────────────────┐
│  Spring Boot 后端（backend）                                                  │
│  common：Result / ErrorCode / JWT / 拦截器 / 访问日志 / 缓存                  │
│  modules：auth user system content home gov request service ai workbench family│
│  AI 链路：RAG(BM25) → Prompt → DeepSeek → SSE；失败回退规则引擎               │
└───────────────┬───────────────────────────────────┬──────────────────────────┘
                │ JDBC                              │ HTTPS
        ┌───────▼────────┐                 ┌────────▼─────────┐
        │ MySQL 8（29 表）│                 │ DeepSeek API     │
        └────────────────┘                 └──────────────────┘""")

h("4.2 页面结构", 2)
table(["分组", "页面", "说明"], [
    ["首页", "index", "通知、轮播、资讯、九宫格、服务提示"],
    ["资讯", "article/list, article/detail", "分栏列表、正文、点赞、上下篇"],
    ["政务", "gov/index, detail, apply, applies, apply-detail", "分类、指南、动态表单、我的办件、进度"],
    ["诉求", "request/create, list, detail", "提交、列表、时间轴、催办、评价"],
    ["便民", "service/index", "黄页、招聘、奶茶会"],
    ["AI", "ai/ai, ai/history", "流式问答、引用、赞踩、历史会话"],
    ["家庭", "family/index", "成员增删改查"],
    ["管理端", "workbench/index, workbench/request-detail", "概览、通知、诉求受理、户籍统计"],
    ["个人", "profile/profile, profile/edit", "登录、资料、头像、我的入口"],
], widths=[3.0, 7.0, 6.0])

h("4.3 前后端协同", 2)
bullet("契约先行：字段、错误码、SSE 事件在 temp/接口契约-v1.md、接口契约-v3.md 冻结，前后端按契约实现。")
bullet("统一响应：Result{code,message,data,traceId,timestamp}；40001/40401/40402/40004 走 HTTP 200，20001→401、20002→403。")
bullet("鉴权：默认公开，@LoginRequired / @AdminRequired 收紧；有 token 一律识别身份（游客可读、登录可操作）。")
bullet("SSE：事件顺序 meta → delta → refs → done；先落库拿真实 messageId 再发 meta，保证赞踩可用。")

h("4.4 数据模型", 2)
table(["域", "表", "用途"], [
    ["区域/村情", "sys_region, sys_village", "县镇村树、村情概况"],
    ["用户", "sys_user, user_family_member", "账号/角色/家庭"],
    ["配置", "sys_config, sys_dict", "footer、功能开关、字典"],
    ["内容", "cms_column, cms_article, cms_article_like, cms_banner, cms_notice", "资讯、横幅、通知"],
    ["政务", "gov_category, gov_item, gov_apply, gov_apply_log", "事项、办件、时间轴"],
    ["诉求", "biz_request, biz_request_log, biz_request_reply", "诉求、时间轴、回复"],
    ["便民", "biz_directory, biz_job, biz_tea_meeting", "黄页、招聘、奶茶会"],
    ["AI", "ai_suggestion, ai_conversation, ai_message", "推荐问、会话、消息"],
    ["户籍", "sys_household, sys_household_member", "户籍统计"],
    ["系统", "sys_event_log, sys_file", "埋点、文件"],
], widths=[2.8, 8.2, 5.0])

h("4.5 AI 接入方案", 2)
para("请求 → 意图识别（规则，用于兜底与 meta）→ RAG 检索 → 提示词（人设 + 资料 + 最近 3 轮历史）→ DeepSeek → SSE 逐字 → 结束回填引用/追问。", first_indent=True)
bullet("检索：文章按 260 字切块、事项按字段拍平；BM25 打分，覆盖率≥0.3、相对分≥0.5；多主题按“和/与/、”拆子问题，每类取前 2 条。")
bullet("提示词：只依据资料、200 字内、分点、引用标题、不补资料外条件；报修/投诉引导到“诉求建议”，紧急情况拨 110。")
bullet("降级：未配置密钥/调用失败/首字前失败 → 规则引擎；首字后失败保留已输出内容并结束。")
bullet("密钥：仅服务端 AI_API_KEY（环境变量或 backend/.env，已 gitignore），不进仓库。")

h("4.6 关键代码片段", 2)
para("（1）RAG 多主题召回（RagService）", size=9.5, bold=True, first_indent=False)
code("""List<String> parts = splitTopics(question);          // “养老和医保有什么区别” → 养老 / 医保
Map<String, Scored> best = new LinkedHashMap<>();
for (String q : parts) {
    int taken = 0;
    for (Scored s : retriever.search(q, topK * 3)) {
        if (s.score() < minScore || s.coverage() < 0.3) continue;
        best.merge(key(s), s, (a, b) -> a.score() >= b.score() ? a : b);
        if (++taken >= 2) break;                      // 每类资料至少 2 条
    }
}""")
para("（2）SSE 流式与落库（AiService）", size=9.5, bold=True, first_indent=False)
code("""String messageId = saveMessage(conv.getId(), userId, "assistant", "", null, null);
sink.send("meta", Map.of("conversationId", conv.getId(), "messageId", messageId, ...));
llmClient.chatStream(messages, delta -> {
    buffer.append(delta);
    sink.send("delta", Map.of("text", delta));
});
aiMapper.finishMessage(messageId, buffer.toString(), Json.write(refs), Json.write(followUps));
sink.send("refs", Map.of("refs", refs));
sink.send("done", done);""")
para("（3）管理员鉴权（AuthInterceptor）", size=9.5, bold=True, first_indent=False)
code("""boolean needAdmin = hm.hasMethodAnnotation(AdminRequired.class) || ...;
if (needAdmin) {
    LoginUser u = UserContext.get();
    if (u == null) throw new BizException(ErrorCode.UNAUTHORIZED);
    if (!"admin".equals(u.getRole())) throw new BizException(ErrorCode.FORBIDDEN, "仅管理员可操作");
}""")

h("4.7 难点与解决", 2)
table(["难点", "解决"], [
    ["契约字段与前端 mock 对齐", "以 data.js + 契约文档为唯一真相，先写契约再写实现，逐字段回归"],
    ["金额、时限、材料规则", "金额存分、后端核定；承诺时间跳周末；材料缺失返回 missingMaterials"],
    ["SSE 首字与 messageId", "先落占位消息拿真实 id 再发 meta；失败自动回退规则并继续输出"],
    ["RAG 多主题只答一半", "按子问题拆分召回、每类配额 2 条；拒答判定只看开头，保留部分引用"],
    ["密钥不能进仓库", "环境变量 + backend/.env（gitignore），仓库只放 .env.example"],
    ["Windows 下 SQL 中文乱码", "run.ps1 用 cmd 重定向导入，避免 PowerShell 管道按 GBK 传参"],
], widths=[6.0, 10.0])
page_break()

# ============ 五、成果展示 ============
h("五、成果展示", 1)
h("5.1 功能截图", 2)
para("以下为建议提交的截图位，按顺序粘贴即可。", size=9.5)
shot("首页：吉林永吉县、通知条、资讯、九宫格")
shot("政务：事项分类与办事指南")
shot("申报：动态表单与材料清单")
shot("我的办件：进度时间轴")
shot("诉求：提交与详情时间轴")
shot("AI：流式回答与引用卡片")
shot("登录：居民/管理员角色选择")
shot("管理端：工作台概览")
shot("管理端：诉求受理与回复")
shot("管理端：户籍统计")
shot("家庭：成员列表")

h("5.2 测试记录", 2)
table(["测试集", "用例数", "结果"], [
    ["接口契约", "50", "50/50 通过"],
    ["页面加载", "16", "16/16 通过"],
    ["页面交互（点赞/申报/AI/诉求/资料）", "17", "17/17 通过"],
    ["管理端工作台", "17", "17/17 通过"],
    ["家庭", "6", "6/6 通过"],
    ["预留接口", "8", "8/8 通过"],
], widths=[7.0, 3.0, 6.0])

h("5.3 运行效果", 2)
bullet("AI 同步回答 1–2.4 秒；流式首字约 0.8–1.4 秒，逐字输出，引用可点。")
bullet("首页接口 10ms 级；申报提交、诉求提交均落库，重启后数据仍在。")
bullet("断网/无密钥时 AI 自动降级规则引擎，回答不中断。")

h("5.4 运行方式", 2)
code("""# 后端（首次会建库、导种子）
cd backend
powershell -ExecutionPolicy Bypass -File .\\run.ps1 -DbPassword 123456

# 小程序
微信开发者工具导入 cilent 目录 → 编译；接口地址在 cilent/utils/config.js""")
page_break()

# ============ 六、历史 ============
h("六、历史说明", 1)
para("本项目为往届作品迭代，三个版本的差异如下：")
table(["版本", "时间", "新增/优化"], [
    ["V1", "2025.11", "小程序框架、村情资讯、政务指南、个人中心、Mock 服务与接口契约"],
    ["V2", "2026.11", "在线申报、诉求建议、AI 问答（规则引擎+SSE）、吉林永吉数据、双登录"],
    ["V3", "2026.11", "管理员工作台（通知/诉求受理/户籍统计）、家庭功能、双角色登录、DeepSeek + RAG"],
], widths=[2.0, 3.0, 11.0])
para("V3 相比 V2 的重点不是“多几个页面”，而是补齐治理闭环：居民提交的诉求有人受理、有回复、可办结；"
     "AI 从规则回答升级为“大模型 + RAG + 引用 + 兜底”。")
page_break()

# ============ 七、落地 ============
h("七、落地规划", 1)
h("7.1 上线计划", 2)
table(["阶段", "范围", "关键动作"], [
    ["试点", "新源村", "完成体验版/正式版审核，村委培训，导入户籍与事项数据"],
    ["复制", "口前镇", "多村配置、镇级数据看板、网格员账号体系"],
    ["推广", "永吉县", "县域 SaaS、与政务平台对接、等保与数据合规"],
], widths=[2.5, 3.5, 10.0])

h("7.2 用户增长", 2)
bullet("线下：村部窗口、网格员上门、公示栏二维码；")
bullet("线上：村民微信群、朋友圈分享卡片、办件/诉求结果分享；")
bullet("激励：办事评价、积分（V4）与村集体福利挂钩。")

h("7.3 运营机制", 2)
bullet("内容：村委每周更新通知/资讯，AI 语料随文章与事项同步；")
bullet("办件：网格员每日巡待办，超时提醒；月度通报办理时长与满意度；")
bullet("数据：户籍统计按月核对，异常数据回到网格核实。")

h("7.4 商业闭环", 2)
para("收入：村级平台服务费（部署+维护+培训）/ 镇级多村版 / 县域平台与数据服务；"
     "成本：服务器与模型调用、实施与培训；"
     "增值：代办服务、助农直播、招聘对接。以单村试点形成样板，再向镇县复制。")

h("7.5 版本路线", 2)
table(["版本", "方向"], [
    ["V4", "微信支付、订阅消息、地图选点、OCR/语音、AI Agent 工具调用"],
    ["V5", "多村 SaaS、镇级看板、开放接口与政务平台对接"],
], widths=[2.5, 13.5])
page_break()

# ============ 附录 A ============
h("附录 A  接口总表（摘要）", 1)
table(["模块", "接口数", "代表接口"], [
    ["认证", "4", "wx-login、password-login、logout"],
    ["首页/内容", "5", "home、columns、articles、article detail、like"],
    ["政务", "9", "categories、items、item detail、applies、apply detail"],
    ["诉求", "5", "create、list、detail、urge、rate"],
    ["便民", "3", "directory、jobs、tea-meetings"],
    ["AI", "7", "suggestions、chat、chat/stream、feedback、conversations"],
    ["用户/家庭", "6", "me、update、family CRUD"],
    ["管理端", "11", "summary、notices CRUD、requests 受理/回复/办结、statistics"],
    ["系统", "6", "configs、modules、regions、dicts、events、files"],
], widths=[3.0, 2.5, 11.0])
para("合计 64 条路由（含预留 8 条返回 40004），详见 temp/接口契约-v1.md、接口契约-v3.md。", size=9.5)

# ============ 附录 B ============
h("附录 B  演示视频脚本（3 分钟）", 1)
table(["时间", "画面", "旁白要点"], [
    ["0:00–0:20", "首页", "新源村情通，村务、办事、诉求、AI 一个入口"],
    ["0:20–0:40", "登录页选管理员", "居民/管理员双角色，管理员账号进入工作台"],
    ["0:40–1:05", "工作台发布通知", "发布后居民首页通知条即时可见"],
    ["1:05–1:35", "诉求受理→回复→办结", "居民提交，管理员受理回复，居民端时间轴同步"],
    ["1:35–1:55", "户籍统计", "按网格、性别、年龄段统计"],
    ["1:55–2:25", "AI 问答", "问医保，流式回答，点引用跳转文章，再追问材料"],
    ["2:25–2:45", "家庭功能", "添加家庭成员，为代办打基础"],
    ["2:45–3:00", "收尾", "技术栈、测试数据、落地规划一句话"],
], widths=[2.8, 5.2, 8.0])

# ============ 附录 C ============
h("附录 C  提交材料清单", 1)
table(["项", "材料", "状态"], [
    ["a", "项目说明（本文第一章）", "已完成"],
    ["b", "小程序与 AI 能力说明（第二章）", "已完成"],
    ["c", "创新点说明（第三章）", "已完成"],
    ["d", "技术实现（第四章）", "已完成"],
    ["e", "成果展示（第五章，截图待粘贴）", "待补截图"],
    ["f", "历史说明（第六章）", "已完成"],
    ["g", "落地规划（第七章）", "已完成"],
    ["—", "演示视频（按附录 B 录制）", "待录制"],
    ["—", "源代码 ZIP（cilent + backend + db + temp）", "待打包"],
], widths=[1.6, 10.4, 4.0])
para("ZIP 命名：第九届传智杯-AI小程序赛道-新源村情通.zip；打包时排除 backend/target、node_modules、*.log、data/upload。", size=9.5)

doc.save(os.path.join(OUT, "新源村情通-作品说明.docx"))
print("saved docx")
