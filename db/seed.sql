-- 自动生成：node db/gen-seed.cjs（数据源 cilent/mock/data.js）
SET NAMES utf8mb4;
USE xinyuan_village;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE sys_region;
TRUNCATE TABLE sys_village;
TRUNCATE TABLE sys_user;
TRUNCATE TABLE sys_config;
TRUNCATE TABLE sys_dict;
TRUNCATE TABLE cms_column;
TRUNCATE TABLE cms_article;
TRUNCATE TABLE cms_article_like;
TRUNCATE TABLE app_module;
TRUNCATE TABLE cms_banner;
TRUNCATE TABLE cms_notice;
TRUNCATE TABLE gov_category;
TRUNCATE TABLE gov_item;
TRUNCATE TABLE gov_apply;
TRUNCATE TABLE gov_apply_log;
TRUNCATE TABLE biz_request;
TRUNCATE TABLE biz_request_log;
TRUNCATE TABLE biz_request_reply;
TRUNCATE TABLE biz_directory;
TRUNCATE TABLE biz_job;
TRUNCATE TABLE biz_tea_meeting;
TRUNCATE TABLE ai_suggestion;
TRUNCATE TABLE ai_conversation;
TRUNCATE TABLE ai_message;

-- 区域树
INSERT INTO sys_region (id, parent_id, name, level, grid, status, sort) VALUES
('220221', '', '永吉县', 1, NULL, 'online', 1),
('220221100', '220221', '口前镇', 2, NULL, 'online', 1),
('22022110001', '220221100', '新源村', 3, '第三网格', 'online', 1),
('22022110002', '220221100', '幸福村', 3, '第一网格', 'preparing', 2),
('22022110003', '220221100', '团结村', 3, '第二网格', 'preparing', 3),
('22022110004', '220221100', '光明村', 3, '第一网格', 'preparing', 4),
('220221200', '220221', '岔路河镇', 2, NULL, 'online', 2),
('22022120001', '220221200', '岔路河村', 3, '第一网格', 'preparing', 1);

-- 村情
INSERT INTO sys_village (id, name, full_name, grid_name, region_path, grid_worker, households, population, party_members) VALUES
('22022110001', '新源村', '吉林省吉林市永吉县 · 口前镇新源村', '第三网格', '["永吉县","口前镇","新源村"]', '{"name":"李建国","phoneDisplay":"138****9072","phone":"13843219072","duty":"周一至周五 10:00—19:30"}', 486, 1632, 41);

-- 用户
INSERT INTO sys_user (id, openid, name, nickname, role_code, role_name, phone, phone_display, avatar_text, avatar_url, region_id, grid_name, house_no, joined_at, is_verified, status, password_hash) VALUES
('u1001', 'seed_openid_u1001', '王秀兰', '王秀兰', 'villager', '村民', '13843216621', '138****6621', '王', '', '22022110001', '第三网格', '三组 26 号', '2025-03-18', 1, 1, '$2a$10$j7flrxK2h9WHXWbFw3t6/.eoyJDx7cNaWsBHAMIU5S8r7gByh5n8e');

-- 应用配置
INSERT INTO sys_config (config_key, config_value, config_group) VALUES
('appName', '新源村情通', 'APP'),
('slogan', '听民意 · 解民忧 · 暖民心', 'APP'),
('hotline', '0432-64216888', 'APP'),
('aiDisclaimer', 'AI 生成内容仅供参考，具体政策以官方发布为准。', 'AI'),
('aiWelcome', '您好，我是新源村 AI 网格员“小贾”。医保缴费、养老参保、独生子女证、高龄补贴……村里的事都可以问我，我会尽量给出政策依据；查不到的我也会直说。', 'AI'),
('footer', '{"organizer":"中共永吉县委组织部","coOrganizer":"新源村村民委员会","reportPhone":"12380","hotline":"0432-64216888","icp":"吉ICP备2026001234号-1","serviceTime":"周一至周五 10:00—19:30","disclaimer":"本平台内容由新源村党群服务中心提供，AI 回答仅供参考，具体以官方发布为准。","version":"V1.1.0"}', 'APP'),
('features', '{"onlineApply":true,"aiStream":true,"voiceInput":false,"familyMembers":false}', 'APP'),
('fileBaseUrl', 'http://127.0.0.1:8080/static/upload', 'APP');

-- 字典
INSERT INTO sys_dict (dict_type, dict_value, dict_label, sort) VALUES
('applyStatus', 'DRAFT', '草稿', 1),
('applyStatus', 'SUBMITTED', '已提交', 2),
('applyStatus', 'ACCEPTED', '已受理', 3),
('applyStatus', 'SUPPLEMENT', '待补正', 4),
('applyStatus', 'APPROVED', '已核准', 5),
('applyStatus', 'PAID', '已缴费', 6),
('applyStatus', 'COMPLETED', '已办结', 7),
('applyStatus', 'REJECTED', '已驳回', 8),
('applyStatus', 'CANCELED', '已撤销', 9),
('materialStatus', 'PENDING', '待上传', 1),
('materialStatus', 'UPLOADED', '已上传', 2),
('materialStatus', 'REJECTED', '需重新上传', 3),
('requestStatus', 'PENDING', '待受理', 1),
('requestStatus', 'ACCEPTED', '已受理', 2),
('requestStatus', 'PROCESSING', '办理中', 3),
('requestStatus', 'COMPLETED', '已办结', 4),
('requestStatus', 'CLOSED', '已关闭', 5),
('requestStatus', 'RATED', '已评价', 6);

-- 栏目
INSERT INTO cms_column (id, code, name, short_name, color, description, sort, status) VALUES
('c1', 'village_news', '村情动态', '动态', '#C4161C', '村里发生的事，第一时间知道', 1, 1),
('c2', 'three_affairs', '三务公开', '公开', '#B3202A', '党务、村务、财务，阳光公开', 2, 1),
('c3', 'folk_culture', '乡风纪实', '乡风', '#E8641B', '身边好人好事，记录文明乡风', 3, 1),
('c4', 'policy_express', '政策速递', '政策', '#BE8430', '惠农政策，讲清楚、说明白', 4, 1);

-- 资讯
INSERT INTO cms_article (id, column_id, title, summary, content, is_top, published_at, views, likes, source, author, status) VALUES
('a1001', 'c1', '关于2026年度城乡居民基本医疗保险集中缴费的通知', '个人缴费380元/人·年，集中缴费期至12月31日，逾期将影响明年医保待遇。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">各位村民：</p><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">根据永吉县医疗保障局、税务局统一安排，2026年度城乡居民基本医疗保险集中缴费工作已经开始。为避免影响您和家人明年的医保报销，请在规定时间内完成缴费。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、缴费标准</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2026年度城乡居民基本医疗保险个人缴费标准为 <strong style="color:#c4161c;">380元/人·年</strong>。特困人员、低保对象、脱贫人口等困难群体按政策享受分类资助，具体以县医保局核定为准。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、集中缴费时间</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2026年9月1日至 <strong>2026年12月31日</strong>。逾期缴费将设置待遇等待期，等待期内发生的医疗费用不能报销。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、缴费方式</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1. 微信搜索“吉林税务社保缴费”小程序，按提示输入姓名、身份证号完成缴费；</p><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2. 持身份证或户口簿到县域内农业银行、农商银行网点柜台缴费；</p><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">3. 不会使用手机的老人，可到村党群服务中心 1 号窗口，由工作人员协助代收代缴。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">四、注意事项</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">新参保、断保人员需先到村党群服务中心完成参保登记，再办理缴费；新生儿出生后 90 天内参保，可自出生之日起享受待遇。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">温馨提示：缴费成功后请保留电子凭证。3 个工作日后可在“吉林医保”小程序查询缴费到账情况。如有疑问，请拨打村党群服务中心电话 0432-64216888，或医保服务热线 12393。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村村民委员会<br/>2026年11月12日</p>', 1, '2026-11-12 09:00', 428, 36, '新源村党群服务中心', '村医保专干 刘芳', 'PUBLISHED'),
('a1002', 'c2', '新源村2026年第三季度村级财务收支公开', '三季度村集体收入18.6万元、支出15.2万元，结余3.4万元，明细同步张贴在村务公开栏。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">根据《中华人民共和国村民委员会组织法》和村务公开有关规定，现将新源村2026年第三季度村级财务收支情况公开如下，接受全体村民监督。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、收入情况（合计 18.6 万元）</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1. 村集体土地租赁收入：8.4 万元；<br/>2. 上级帮扶资金：6.2 万元；<br/>3. 其他收入（场地使用、利息等）：4.0 万元。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、支出情况（合计 15.2 万元）</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1. 村组道路维修：5.6 万元；<br/>2. 人居环境整治：3.8 万元；<br/>3. 村级组织办公经费：1.9 万元；<br/>4. 困难群众慰问：2.1 万元；<br/>5. 其他支出：1.8 万元。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、结余情况</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">本季度收支结余 3.4 万元，已存入村集体账户，纳入下季度预算管理。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">公开时间：2026年11月10日至11月17日。公开地点：村党群服务中心一楼公开栏、村民微信群。如对收支有疑问，请在公示期内向村务监督委员会反映，监督电话：0432-64216888。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村村务监督委员会<br/>2026年11月10日</p>', 0, '2026-11-10 17:30', 216, 18, '新源村村务监督委员会', '村务监督委员会', 'PUBLISHED'),
('a1003', 'c3', '“助农直播”走进新源村：一下午卖出1.2万斤苹果', '青年志愿队帮果农直播带货，线上线下联动，解了苹果滞销的燃眉之急。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">“家人们看，这是我们新源村刚下树的红富士，脆甜多汁，今天下单明天发货！”11月7日下午，村党群服务中心院子里架起了补光灯和手机支架，一场助农直播正在进行。</p><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">今年村里苹果丰收，但部分果农缺少销售渠道。村新时代文明实践站联合镇团委，组织 8 名青年志愿者走进果园和农户家中，用直播的方式帮乡亲们卖苹果。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">线上线下一起发力</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">直播持续 3 个多小时，累计观看 2.6 万人次，成交 1860 单，卖出苹果 1.2 万斤。志愿者还帮 12 户果农注册了线上店铺，教会他们自己上架商品。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">把“流量”变成“留量”</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">“卖一次不算本事，关键是让乡亲们学会自己卖。”志愿者服务队负责人说，接下来将每月组织一次电商培训，帮助更多农户掌握手机“新农具”。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">目前村里仍有少量晚熟苹果待售，有需要的村民和爱心企业可联系村党群服务中心：0432-64216888。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村新时代文明实践站<br/>2026年11月8日</p>', 0, '2026-11-08 20:10', 189, 42, '新源村新时代文明实践站', '通讯员 马晓燕', 'PUBLISHED'),
('a1004', 'c2', '关于发放2026年耕地地力保护补贴的公示', '涉及286户、耕地3120亩，补贴标准95元/亩，公示期7天，如有异议请及时反馈。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">根据永吉县农业农村局、财政局《关于做好2026年耕地地力保护补贴发放工作的通知》要求，现将我村补贴发放情况公示如下。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、补贴范围</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">全村 286 户、耕地 3120 亩，补贴标准为 95 元/亩，合计发放 29.64 万元。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、发放方式</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">补贴资金通过“一卡通”直接发放到户，请各户核对姓名、身份证号、银行卡号是否准确。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、公示时间</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2026年11月6日至11月12日，共 7 天。公示表张贴在村党群服务中心公开栏，也可到村委会查询。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">对公示内容有异议的，请在公示期内携带土地承包经营权证、身份证到村委会核对，或拨打监督电话 0432-64216888。逾期未提出异议的，视为无异议。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村村民委员会<br/>2026年11月6日</p>', 0, '2026-11-06 10:20', 154, 9, '新源村村民委员会', '村农经员 张建军', 'PUBLISHED'),
('a1005', 'c3', '新源村“好婆婆·好媳妇·好邻居”评选结果揭晓', '12位村民上榜，村里敲锣打鼓把荣誉送到家，用身边人讲好身边事。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">经过村民推荐、网格初评、村“两委”审议和为期 5 天的公示，新源村2026年度“好婆婆·好媳妇·好邻居”评选结果正式揭晓，12 位村民获得荣誉。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">评选结果</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">好婆婆：张桂兰、马秀英、王凤霞；<br/>好媳妇：李春梅、赵丽娜、刘晓芳；<br/>好邻居：赵大山、孙德福、陈玉兰；<br/>文明家庭：王秀兰家庭、刘志强家庭、周建国家庭。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">把荣誉送到家门口</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">11月2日，村“两委”和妇联敲锣打鼓，把证书和奖品送到获奖者家中。好媳妇李春梅说：“照顾老人是应该的，没想到村里还记着。”</p><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">评选不是目的，向身边人学习才是。希望大家从自家做起、从邻里做起，让新源村更有人情味。</p><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村妇联<br/>2026年11月3日</p>', 0, '2026-11-03 16:40', 167, 31, '新源村妇联', '村妇联主席 王丽华', 'PUBLISHED'),
('a1006', 'c4', '2027年度城乡居民基本养老保险参保缴费指南', '12个缴费档次200—3000元，多缴多得、长缴多得，政府按档次给予补贴。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2027年度城乡居民基本养老保险参保缴费工作已启动。为方便村民了解政策，现将缴费档次、补贴标准和待遇领取条件说明如下。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、参保范围</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">年满 16 周岁（不含在校学生），具有永吉县户籍，未参加职工基本养老保险的城乡居民。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、缴费档次</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">每人每年 200 元、300 元、500 元、800 元、1000 元、1500 元、2000 元、2500 元、3000 元等 12 个档次，参保人自主选择，多缴多得。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、政府补贴</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">按缴费档次给予相应补贴，补贴资金计入个人账户。选择 500 元以上档次的，补贴标准更高。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">四、待遇领取</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">年满 60 周岁、累计缴费满 15 年，可按月领取养老金。养老金由基础养老金和个人账户养老金组成，终身领取。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">缴费请通过“吉林税务社保缴费”小程序或到村党群服务中心办理。具体档次和补贴金额以县社保中心当年公布为准，咨询电话：12333。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">永吉县社会保险中心<br/>2026年10月30日</p>', 0, '2026-10-30 11:15', 302, 25, '永吉县人力资源和社会保障局', '县社保中心', 'PUBLISHED'),
('a1007', 'c1', '冬季取暖安全提示：谨防一氧化碳中毒', '用煤炉取暖务必保持通风，建议安装一氧化碳报警器，出现头晕恶心立即开窗撤离。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">天气转冷，村里部分家庭开始用煤炉、炭火取暖。每年冬季都是一氧化碳中毒的高发期，请大家务必注意安全。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">这些情况最危险</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1. 在密闭房间内使用煤炉、炭盆取暖；<br/>2. 烟囱堵塞、倒风或接口不严；<br/>3. 停车后长时间在车内开空调休息。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">记住四个“一定要”</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">一定要保持室内通风，睡觉前检查炉火；一定要安装合格的一氧化碳报警器；一定要定期清理烟囱；一定要教会老人和孩子识别中毒症状。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">发现中毒怎么办</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">立即打开门窗通风，迅速将人转移到空气新鲜处，解开衣领、保持呼吸道通畅，并拨打 120 急救电话。不要在现场开灯、打电话或使用明火，以免引发爆炸。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">如家中没有一氧化碳报警器，可到村党群服务中心登记，村里将协调统一采购。联系电话：0432-64216888。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村新时代文明实践站<br/>2026年10月28日</p>', 0, '2026-10-28 09:30', 233, 14, '新源村新时代文明实践站', '村安全员 李强', 'PUBLISHED'),
('a1008', 'c1', '新源村党群服务中心11月值班表', '工作日10:00—13:30、15:30—19:30；周末及节假日可提前预约，急事请打电话。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">为方便村民办事，现将新源村党群服务中心11月值班安排公布如下。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">值班时间</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">周一至周五：10:00—13:30，15:30—19:30；<br/>周六、周日：预约服务（请提前一天电话预约）。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">窗口分工</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1号窗口：医保、养老、社保咨询；<br/>2号窗口：民政、残联、高龄补贴；<br/>3号窗口：计生、户籍、证明事项；<br/>综合窗口：诉求登记、矛盾调解、政策咨询。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">值班电话</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">0432-64216888（工作时间）；13843219072（网格员李建国，24小时应急）。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">如遇紧急情况，请直接拨打 110、120 或 119。行动不便的老人可联系网格员上门代办。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村党群服务中心<br/>2026年10月31日</p>', 0, '2026-10-31 18:00', 98, 5, '新源村党群服务中心', '村综合办', 'PUBLISHED'),
('a1009', 'c4', '独生子女父母光荣证办理须知', '符合条件的夫妻可到村党群服务中心代办，材料齐全5个工作日办结。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">近期不少村民咨询独生子女父母光荣证的办理条件。现将有关事项说明如下，符合条件的可到村党群服务中心提交材料，由村里统一代办。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、办理条件</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">1. 夫妻双方或一方具有永吉县户籍；<br/>2. 2016年1月1日之前生育一个子女，且自愿终身只生育一个子女；<br/>3. 子女未满 18 周岁，或已满 18 周岁但父母未再生育、未收养子女。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、所需材料</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">夫妻双方身份证、户口簿、结婚证、子女出生医学证明、近期免冠照片各 2 张。再婚家庭需提供离婚协议或判决书。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、办理时限</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">材料齐全的，5 个工作日内办结。证件可到村党群服务中心领取，也可申请邮寄到家。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">2016年1月1日之后生育第一个子女的夫妻，不再办理独生子女父母光荣证。具体政策以县卫健委解释为准，咨询电话：12356。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">永吉县卫生健康委员会<br/>2026年10月25日</p>', 0, '2026-10-25 15:10', 276, 21, '永吉县卫生健康委员会', '县卫健委', 'PUBLISHED'),
('a1010', 'c1', '新源村高标准农田建设项目施工公告', '11月15日起对三组、四组渠系进行改造，施工期间请绕行，注意安全。', '<p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">为改善农田灌溉条件，经县农业农村局批准，我村高标准农田建设项目将于近期开工。现将有关事项公告如下。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">一、施工范围</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">三组、四组斗渠及附属建筑物，全长约 3.2 公里。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">二、施工时间</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">2026年11月15日至2027年4月30日。如遇极端天气顺延。</p><h4 style="margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;">三、注意事项</h4><p style="margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;">施工期间部分田间道路封闭，请村民绕行，不要进入围挡区域；看管好老人和儿童；农机作业请提前与施工方沟通。</p><div style="margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;">施工给您带来不便，敬请谅解。对施工质量、进度有意见或建议，请联系村项目办：0432-64216888。</div><p style="margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;">新源村村民委员会<br/>2026年11月11日</p>', 0, '2026-11-11 08:40', 121, 6, '新源村村民委员会', '村项目办', 'PUBLISHED');

-- 九宫格
INSERT INTO app_module (id, code, name, desc_text, icon, tint, route, status, badge, version, highlight, sort) VALUES
('m1', 'consult', '咨询帮办', '有事您说话', '/assets/icons/grid-consult.png', '#FBE9E9', '/pages/request/create?type=consult', 'online', '', 'V2', 0, 1),
('m2', 'appeal', '诉求建议', '件件有回音', '/assets/icons/grid-advice.png', '#FDF0E8', '/pages/request/create?type=appeal', 'online', '', 'V2', 0, 2),
('m3', 'tea_meeting', '线上奶茶会', '议村里的事', '/assets/icons/grid-tea.png', '#FAF3E3', '/pages/service/index?tab=tea', 'online', '', 'V2', 0, 3),
('m4', 'directory', '服务黄页', '水电气暖电话', '/assets/icons/grid-directory.png', '#F8EAEA', '/pages/service/index?tab=directory', 'online', '', 'V2', 0, 4),
('m5', 'gov', '政务管理', '4 类事项可办', '/assets/icons/grid-gov.png', '#C4161C', '/pages/gov/index', 'online', '4 类', 'V1', 1, 5),
('m6', 'jobs', '就业招聘', '家门口找工作', '/assets/icons/grid-jobs.png', '#F9EDE9', '/pages/service/index?tab=jobs', 'online', '', 'V2', 0, 6);

-- Banner 与通知
INSERT INTO cms_banner (id, tag, title, title_highlight, subtitle, meta, action_text, article_id, theme, status) VALUES
('b1', '医保征缴', '2026年度城乡居民医保', '集中缴费开始了', '手机可缴 · 村部也可代收', '截止 12 月 31 日 · 逾期影响待遇', '查看缴费指南', 'a1001', 'red', 1);
INSERT INTO cms_notice (id, text, type, article_id, status) VALUES
('n1', '2026年度城乡居民医保集中缴费将于12月31日截止', 'urgent', 'a1001', 1);

-- 政务分类
INSERT INTO gov_category (id, code, name, desc_text, sort) VALUES
('all', 'all', '全部事项', '四类高频事项', 1),
('social', 'social', '社会保障', '医保、养老、高龄补贴', 2),
('medical', 'medical', '医疗卫生', '出生证明、健康服务', 3),
('family', 'family', '人口计生', '独生子女、生育登记', 4),
('employment', 'employment', '就业创业', '就业登记、创业扶持', 5);

-- 政务事项
INSERT INTO gov_item (id, code, category_id, category_name, name, short_name, summary, icon, icon_tint, tags, target, promise_days, fee, phone, address, update_at, conditions_json, materials, steps, form_fields, basis, faqs, status, sort) VALUES
('g1', 'YB001', 'social', '社会保障', '城乡居民基本医疗保险参保缴费', '医保缴费', '个人缴费 380 元，集中缴费期至 12 月 31 日，支持线上、银行、村部代收。', '医', '#FBE9E9', '["线上可办","材料 2 项","承诺 1 天"]', '本村户籍居民及常住人口', 1, '380 元/人·年（资助对象按政策减免）', '0432-64216888', '新源村党群服务中心 1 号窗口', '2026-11-12', '["具有本村户籍，或持有本地居住证且在本村常住","未参加职工基本医疗保险","新参保、断保人员需先完成参保登记"]', '[{"name":"身份证或户口簿","required":true,"note":"原件核验，复印件 1 份"},{"name":"居住证（非本村户籍）","required":false,"note":"常住人口提供"},{"name":"本人银行卡","required":false,"note":"用于签订代扣协议，可选"}]', '[{"title":"参保登记","desc":"携带身份证或户口簿到村党群服务中心登记，已参保人员可跳过"},{"title":"选择缴费方式","desc":"微信小程序、银行网点或村部代收"},{"title":"确认缴费信息","desc":"核对姓名、身份证号、参保年度和人员类别"},{"title":"完成缴费","desc":"缴费成功后保留电子凭证或银行回单"},{"title":"查询到账","desc":"3 个工作日后可在“吉林医保”小程序查询"}]', '[{"label":"参保人姓名","type":"text","placeholder":"请输入参保人姓名","required":true},{"label":"身份证号","type":"idcard","placeholder":"请输入 18 位身份证号","required":true},{"label":"参保年度","type":"select","options":["2026 年度"],"required":true},{"label":"人员类别","type":"radio","options":["普通居民","低保对象","特困人员","脱贫人口"],"required":true},{"label":"联系电话","type":"text","placeholder":"用于接收办理进度","required":true}]', '["《吉林省城乡居民基本医疗保险实施办法》","《永吉县2026年度城乡居民基本医疗保险参保缴费通告》"]', '[{"q":"错过集中缴费期还能补缴吗？","a":"可以补缴，但会设置待遇等待期，等待期内发生的医疗费用不能报销。建议在 12 月 31 日前完成。"},{"q":"老人不会用手机怎么办？","a":"可携带身份证或户口簿到村党群服务中心 1 号窗口，由工作人员协助代收代缴；行动不便的可联系网格员上门。"}]', 1, 1),
('g2', 'YL002', 'social', '社会保障', '城乡居民基本养老保险参保缴费', '养老保险', '12 个缴费档次 200—3000 元，多缴多得、长缴多得，政府按档次补贴。', '养', '#FDF0E8', '["线上可办","材料 2 项","承诺 1 天"]', '年满 16 周岁、未参加职工养老保险的本村户籍居民', 1, '200—3000 元/年，自主选择档次', '0432-64216888', '新源村党群服务中心 1 号窗口', '2026-10-30', '["年满 16 周岁（不含在校学生）","具有永吉县户籍","未参加城镇职工基本养老保险"]', '[{"name":"身份证或户口簿","required":true,"note":"原件核验"},{"name":"本人银行卡","required":true,"note":"用于签订代扣协议"}]', '[{"title":"选择缴费档次","desc":"根据家庭情况选择 200—3000 元之间的档次"},{"title":"参保登记","desc":"首次参保到村党群服务中心登记个人信息"},{"title":"签订代扣协议","desc":"绑定本人银行卡，或选择每年手动缴费"},{"title":"完成缴费","desc":"通过小程序、银行或村部完成缴费"},{"title":"查询个人账户","desc":"可在“吉林智慧人社”小程序查询缴费记录"}]', '[{"label":"参保人姓名","type":"text","placeholder":"请输入参保人姓名","required":true},{"label":"身份证号","type":"idcard","placeholder":"请输入 18 位身份证号","required":true},{"label":"缴费档次","type":"select","options":["200 元","300 元","400 元","500 元","600 元","800 元","1000 元","1200 元","1500 元","2000 元","2500 元","3000 元"],"required":true},{"label":"联系电话","type":"text","placeholder":"用于接收办理进度","required":true}]', '["《吉林省城乡居民基本养老保险实施办法》","《永吉县2027年度城乡居民基本养老保险参保缴费通知》"]', '[{"q":"缴满 15 年还要继续缴吗？","a":"缴满 15 年是最低年限，继续缴费可增加个人账户积累，退休后领取的养老金更高。"}]', 1, 2),
('g3', 'GJ003', 'social', '社会保障', '高龄老人生活津贴申领', '高龄补贴', '80 周岁以上老人可按月领取津贴，需提供身份证、户口簿和银行卡。', '龄', '#FAF3E3', '["村部代办","材料 4 项","承诺 7 天"]', '年满 80 周岁、具有本村户籍的老年人', 7, '免费', '0432-64216888', '新源村党群服务中心 2 号窗口', '2026-10-20', '["年满 80 周岁","具有永吉县户籍","未享受同类高龄津贴"]', '[{"name":"身份证","required":true,"note":"原件及复印件 2 份"},{"name":"户口簿","required":true,"note":"首页及本人页复印件"},{"name":"本人银行卡","required":true,"note":"用于按月发放"},{"name":"近期免冠照片","required":true,"note":"1 寸 2 张"}]', '[{"title":"提交申请","desc":"本人或家属到村党群服务中心提交材料"},{"title":"村级初审","desc":"村委会核实年龄、户籍和享受情况"},{"title":"乡镇审核","desc":"乡镇民政办复核并公示 5 天"},{"title":"县级审批","desc":"县民政局审批后按月发放"}]', '[{"label":"老人姓名","type":"text","placeholder":"请输入老人姓名","required":true},{"label":"身份证号","type":"idcard","placeholder":"请输入 18 位身份证号","required":true},{"label":"出生日期","type":"date","placeholder":"请选择出生日期","required":true},{"label":"银行卡号","type":"text","placeholder":"请输入本人银行卡号","required":true}]', '["《永吉县高龄老人生活津贴发放管理办法》"]', '[{"q":"老人行动不便，能上门办理吗？","a":"可以。请联系第三网格网格员李建国 13843219072，预约上门采集信息。"}]', 1, 3),
('g4', 'DZ004', 'family', '人口计生', '独生子女父母光荣证核发', '独生子女证', '2016 年前生育一个子女的夫妻可申请，材料齐全 5 个工作日办结。', '计', '#F8EAEA', '["村部代办","材料 5 项","承诺 5 天"]', '符合政策的本村户籍夫妻', 5, '免费', '0432-64216888', '新源村党群服务中心 3 号窗口', '2026-10-25', '["夫妻双方或一方具有永吉县户籍","2016 年 1 月 1 日之前生育一个子女，且自愿终身只生育一个子女","子女未满 18 周岁，或已满 18 周岁但父母未再生育、未收养子女"]', '[{"name":"夫妻双方身份证","required":true,"note":"原件及复印件"},{"name":"户口簿","required":true,"note":"首页及本人页"},{"name":"结婚证","required":true,"note":"再婚家庭提供离婚协议或判决书"},{"name":"子女出生医学证明","required":true,"note":"原件及复印件"},{"name":"免冠照片","required":true,"note":"夫妻双方各 2 张"}]', '[{"title":"提交材料","desc":"到村党群服务中心 3 号窗口提交，填写申请表"},{"title":"村级初审","desc":"村委会核实婚育情况并公示 5 天"},{"title":"乡镇复核","desc":"乡镇卫健办复核材料"},{"title":"县级发证","desc":"县卫健委制证，村里代领后通知领取"}]', '[{"label":"申请人姓名","type":"text","placeholder":"请输入申请人姓名","required":true},{"label":"身份证号","type":"idcard","placeholder":"请输入 18 位身份证号","required":true},{"label":"结婚登记日期","type":"date","placeholder":"请选择结婚登记日期","required":true},{"label":"子女姓名","type":"text","placeholder":"请输入子女姓名","required":true},{"label":"子女出生日期","type":"date","placeholder":"请选择子女出生日期","required":true}]', '["《中华人民共和国人口与计划生育法》","《吉林省人口与计划生育条例》"]', '[{"q":"2016 年以后出生的孩子还能办吗？","a":"不能。2016 年 1 月 1 日之后生育第一个子女的夫妻，不再办理独生子女父母光荣证。"}]', 1, 4),
('g5', 'CS005', 'medical', '医疗卫生', '出生医学证明首次签发', '出生证明', '新生儿出生后由分娩医院签发，需提供父母身份证、结婚证等材料。', '生', '#FBE9E9', '["医院办理","材料 4 项","承诺 1 天"]', '在本县助产机构分娩的新生儿', 1, '免费', '0432-64216888', '永吉县人民医院产科（出生证明窗口）', '2026-10-18', '["新生儿在本县助产机构出生","父母双方身份信息真实、完整","原则上由母亲本人办理；父亲代办需提供授权委托书"]', '[{"name":"父母双方身份证","required":true,"note":"原件及复印件"},{"name":"结婚证","required":true,"note":"原件及复印件"},{"name":"出生医学证明首次签发登记表","required":true,"note":"分娩医院提供"},{"name":"授权委托书","required":false,"note":"父亲代办时提供"}]', '[{"title":"确定新生儿姓名","desc":"出生证明一经签发，姓名不予更改，请提前确定"},{"title":"准备材料","desc":"父母身份证、结婚证、登记表"},{"title":"到院办理","desc":"到分娩医院出生证明窗口提交材料"},{"title":"领取证件","desc":"材料齐全当场签发，妥善保管"}]', '[{"label":"新生儿姓名","type":"text","placeholder":"请输入新生儿姓名","required":true},{"label":"出生日期","type":"date","placeholder":"请选择出生日期","required":true},{"label":"母亲姓名","type":"text","placeholder":"请输入母亲姓名","required":true},{"label":"父亲姓名","type":"text","placeholder":"请输入父亲姓名","required":true}]', '["《出生医学证明管理办法》"]', '[{"q":"出生证明丢了能补办吗？","a":"可以到原签发机构申请补发，需提供父母身份证、户口簿及书面申请，具体以医院要求为准。"}]', 1, 5),
('g6', 'JY006', 'employment', '就业创业', '就业失业登记证办理', '就业登记', '用于享受就业扶持政策、申请创业担保贷款，材料齐全 3 个工作日办结。', '业', '#F9EDE9', '["村部代办","材料 4 项","承诺 3 天"]', '法定劳动年龄内有就业意愿的本村居民', 3, '免费', '0432-64216888', '新源村党群服务中心 1 号窗口', '2026-10-12', '["年满 16 周岁、未达到法定退休年龄","有劳动能力和就业意愿","具有本村户籍或持有本地居住证"]', '[{"name":"身份证","required":true,"note":"原件及复印件"},{"name":"户口簿","required":true,"note":"首页及本人页"},{"name":"免冠照片","required":true,"note":"2 寸 2 张"},{"name":"失业证明或解除劳动关系证明","required":false,"note":"有工作经历者提供"}]', '[{"title":"提交申请","desc":"到村党群服务中心填写就业失业登记表"},{"title":"村级受理","desc":"核实身份和就业状态"},{"title":"乡镇审核","desc":"乡镇劳动保障所审核"},{"title":"领取证件","desc":"3 个工作日后到村部领取"}]', '[{"label":"姓名","type":"text","placeholder":"请输入姓名","required":true},{"label":"身份证号","type":"idcard","placeholder":"请输入 18 位身份证号","required":true},{"label":"文化程度","type":"select","options":["初中及以下","高中/中专","大专","本科及以上"],"required":true},{"label":"就业状态","type":"radio","options":["失业","灵活就业","自主创业"],"required":true}]', '["《就业失业登记证管理办法》","《吉林省就业促进条例》"]', '[{"q":"这个证有什么用？","a":"可用于申请就业培训补贴、创业担保贷款、社保补贴等就业扶持政策，具体以县人社局公布为准。"}]', 1, 6);

-- AI 推荐问
INSERT INTO ai_suggestion (id, text, icon, sort) VALUES
('s1', '今年医保怎么缴？', '💊', 1),
('s2', '独生子女证需要什么材料？', '📄', 2),
('s3', '养老缴费有哪些档次？', '🧾', 3),
('s4', '高龄补贴怎么申请？', '👵', 4);

-- 服务黄页 / 招聘 / 奶茶会
INSERT INTO biz_directory (id, category, name, desc_text, phone, phone_display, hours, icon, color, tint, sort) VALUES
('d1', '供水', '永吉县自来水公司', '报修、缴费、停水通知', '043264212345', '0432-64212345', '24 小时抢修', '水', '#2F7FB8', '#EAF4FB', 1),
('d2', '供电', '国网永吉县供电公司', '故障报修、电费查询', '043264223333', '0432-64223333', '24 小时抢修 · 95598', '电', '#C99437', '#FBF4E2', 2),
('d3', '燃气', '永吉县燃气公司', '燃气报修、开户、安检', '043264234567', '0432-64234567', '10:00—19:30', '气', '#D06A2D', '#FDF0E8', 3),
('d4', '供暖', '口前镇供热站', '暖气不热、管道漏水', '043264245678', '0432-64245678', '供暖季 24 小时', '暖', '#B3202A', '#FBEBEB', 4),
('d5', '维修', '村水电维修组', '跳闸、水管、门锁小修', '13843219072', '138****9072', '08:00—22:00', '修', '#2F8A59', '#EAF4EE', 5),
('d6', '医疗', '新源村卫生室', '常见病、慢病配药、测量血压', '043264278901', '0432-64278901', '10:00—19:30', '医', '#2F7FB8', '#EAF4FB', 6),
('d7', '医疗', '永吉县人民医院', '急诊、住院、出生证明', '120', '120', '24 小时急诊', '院', '#C4161C', '#FBEBEB', 7),
('d8', '村务', '新源村党群服务中心', '办事咨询、诉求登记、代办', '043264216888', '0432-64216888', '周一至周五 10:00—19:30', '村', '#C4161C', '#FBEBEB', 8);
INSERT INTO biz_job (id, title, company, salary, count_num, location, tags, desc_text, contact, contact_display, published_at, deadline, status, sort) VALUES
('j1', '村内保洁员', '新源村村民委员会', '1800—2200 元/月', 2, '新源村三组、四组', '["长期","缴纳意外险","就近"]', '负责村组道路日常保洁、垃圾清运配合，每天 4 小时左右，适合本村常住村民。', '043264216888', '0432-64216888', '2026-11-10', '2026-11-30', 1, 1),
('j2', '苹果分拣、包装临时工', '新源果业合作社', '150 元/天，日结', 10, '新源村冷库', '["临时","日结","包午餐"]', '苹果分拣、装箱，11 月 18 日—12 月 10 日，每天 8 小时，男女不限。', '13843219072', '138****9072', '2026-11-12', '2026-11-25', 1, 2),
('j3', '电商客服（可居家）', '永吉县电商公共服务中心', '3000—4500 元/月', 1, '县城 / 居家', '["长期","会手机操作","培训"]', '负责农产品网店客服、订单处理，提供岗前培训，会使用手机和电脑即可。', '043264288666', '0432-64288666', '2026-11-08', '2026-12-15', 1, 3),
('j4', '小区保安', '永吉县城投物业', '2600 元/月', 2, '县城幸福小区', '["长期","包住","轮班"]', '门岗值守、巡逻，要求 55 岁以下、身体健康，退伍军人优先。', '043264299000', '0432-64299000', '2026-11-05', '2026-12-01', 1, 4);
INSERT INTO biz_tea_meeting (id, title, meet_date, location, status, joined, total, host, summary, agenda, sort) VALUES
('t1', '冬季取暖安全怎么管？', '2026-11-20 20:00', '村党群服务中心二楼', '报名中', 18, 40, '村两委 · 新时代文明实践站', '一起议一议煤炉取暖、一氧化碳报警器、独居老人上门检查的安排。', '["通报今年取暖安全形势","村民提问题、提办法","确定网格员包户名单"]', 1),
('t2', '医保缴费“最后一公里”', '2026-12-05 20:00', '村党群服务中心二楼', '报名中', 26, 40, '村医保专干 刘芳', '不会用手机缴费的老人怎么办？集中代缴怎么安排？现场演示手机缴费。', '["演示手机缴费流程","统计需要上门代缴的老人","确定集中代缴时间"]', 2),
('t3', '苹果销售与电商', '2026-11-08 20:00', '村党群服务中心二楼', '已结束', 32, 40, '村新时代文明实践站', '复盘助农直播经验，商量明年苹果怎么卖得更远。', '["直播复盘","包装与物流问题","明年电商培训计划"]', 3);

-- 种子办件
INSERT INTO gov_apply (id, apply_no, user_id, item_code, item_name, item_short_name, status, amount, form_data, materials, missing_materials, agent_user_id, agent_name, rating_score, rating_comment, rating_time, created_at, promise_at) VALUES
('ap_seed_1', 'SB202611130001', 'u1001', 'YB001', '城乡居民基本医疗保险参保缴费', '医保缴费', 'SUBMITTED', 38000, '{"参保人姓名":"王秀兰","身份证号":"220221********002X","参保年度":"2026 年度","人员类别":"普通居民","联系电话":"138****6621"}', '[{"name":"身份证或户口簿","required":true,"uploaded":true},{"name":"居住证（非本村户籍）","required":false,"uploaded":false},{"name":"本人银行卡","required":false,"uploaded":false}]', '[]', NULL, '', 0, NULL, NULL, '2026-11-13 10:20', '2026-11-16 19:30'),
('ap_seed_2', 'SB202611050002', 'u1001', 'GJ003', '高龄老人生活津贴申领', '高龄补贴', 'COMPLETED', 0, '{"老人姓名":"王秀兰","身份证号":"220221********002X","出生日期":"1944-08-16","银行卡号":"6228 **** **** 6621"}', '[{"name":"身份证","required":true,"uploaded":true},{"name":"户口簿","required":true,"uploaded":true},{"name":"本人银行卡","required":true,"uploaded":true},{"name":"近期免冠照片","required":true,"uploaded":true}]', '[]', NULL, '', 0, NULL, NULL, '2026-11-05 09:10', '2026-11-12 19:30'),
('ap_seed_3', 'SB202611100003', 'u1001', 'DZ004', '独生子女父母光荣证核发', '独生子女证', 'SUPPLEMENT', 0, '{"申请人姓名":"王秀兰","身份证号":"220221********002X","结婚登记日期":"2008-06-12","子女姓名":"李晓梅","子女出生日期":"2010-03-08"}', '[{"name":"夫妻双方身份证","required":true,"uploaded":true},{"name":"户口簿","required":true,"uploaded":true},{"name":"结婚证","required":true,"uploaded":true},{"name":"子女出生医学证明","required":true,"uploaded":false},{"name":"免冠照片","required":true,"uploaded":false}]', '["子女出生医学证明"]', NULL, '', 0, NULL, NULL, '2026-11-10 15:40', '2026-11-17 19:30');
INSERT INTO gov_apply_log (apply_id, status, label, time_text, operator, note, sort) VALUES
('ap_seed_1', 'SUBMITTED', '已提交', '2026-11-13 10:20', '王秀兰', '提交医保缴费申请，等待受理', 1),
('ap_seed_2', 'SUBMITTED', '已提交', '2026-11-05 09:10', '王秀兰', '提交高龄津贴申请', 1),
('ap_seed_2', 'ACCEPTED', '已受理', '2026-11-05 15:30', '李建国', '材料齐全，已受理', 2),
('ap_seed_2', 'APPROVED', '已核准', '2026-11-10 11:00', '口前镇民政办', '符合 80 周岁高龄津贴条件', 3),
('ap_seed_2', 'COMPLETED', '已办结', '2026-11-12 16:20', '新源村党群服务中心', '津贴自 11 月起按月发放', 4),
('ap_seed_3', 'SUBMITTED', '已提交', '2026-11-10 15:40', '王秀兰', '提交独生子女证申请', 1),
('ap_seed_3', 'ACCEPTED', '已受理', '2026-11-11 09:20', '李建国', '材料初审通过', 2),
('ap_seed_3', 'SUPPLEMENT', '待补正', '2026-11-11 16:10', '新源村党群服务中心', '缺子女出生医学证明，请补齐后重新提交', 3);

-- 种子诉求
INSERT INTO biz_request (id, request_no, user_id, type, type_label, title, content, location, contact_phone, photos, status, urge_count, rating_score, rating_comment, rating_time, created_at) VALUES
('rq_seed_1', 'QZ202611090001', 'u1001', 'appeal', '诉求建议', '三组东侧路灯不亮，晚上出行不安全', '三组 26 号东侧的两盏路灯坏了快一周，晚上老人散步看不清路，希望尽快维修。', '三组 26 号东侧', '138****6621', '[]', 'PROCESSING', 0, 0, NULL, NULL, '2026-11-09 20:10'),
('rq_seed_2', 'QZ202611020002', 'u1001', 'consult', '咨询帮办', '医保异地就医备案怎么办理？', '我女儿在长春住院，想用新源的医保报销，需要提前备案吗？要哪些材料？', '', '138****6621', '[]', 'COMPLETED', 0, 0, NULL, NULL, '2026-11-02 09:30');
INSERT INTO biz_request_log (request_id, status, label, time_text, operator, note, sort) VALUES
('rq_seed_1', 'PENDING', '待受理', '2026-11-09 20:10', '王秀兰', '提交诉求', 1),
('rq_seed_1', 'ACCEPTED', '已受理', '2026-11-10 08:40', '李建国', '已到现场核实，联系维修队', 2),
('rq_seed_1', 'PROCESSING', '办理中', '2026-11-10 14:00', '村水电维修组', '已采购灯头，预计 11 月 15 日前更换', 3),
('rq_seed_2', 'PENDING', '待受理', '2026-11-02 09:30', '王秀兰', '提交咨询', 1),
('rq_seed_2', 'ACCEPTED', '已受理', '2026-11-02 10:10', '刘芳', '医保专干接手', 2),
('rq_seed_2', 'COMPLETED', '已办结', '2026-11-02 11:20', '刘芳', '已电话回复并发送备案操作步骤', 3);
INSERT INTO biz_request_reply (request_id, time_text, operator, content, sort) VALUES
('rq_seed_1', '2026-11-10 14:05', '李建国', '您好，路灯配件已到货，这两天会安排更换，请再耐心等一下。', 1),
('rq_seed_2', '2026-11-02 11:20', '刘芳', '已电话告知：在“吉林医保”小程序做异地就医备案，选长春，上传身份证和住院证明即可。', 1);
SET FOREIGN_KEY_CHECKS = 1;
