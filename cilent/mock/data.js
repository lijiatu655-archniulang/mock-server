/* eslint-disable */
/**
 * V1 演示种子数据（与截图/设计文档 8.1 对齐）
 * 所有文案、金额、时限均为演示样例，正式上线前由村级运营人员维护。
 */

const P = 'margin:0 0 14px;font-size:16px;line-height:1.9;color:#3a3c40;'
const H = 'margin:24px 0 10px;font-size:17px;font-weight:700;line-height:1.6;color:#202124;padding-left:10px;border-left:4px solid #c4161c;'
const NOTE = 'margin:18px 0;padding:14px 16px;background:#fbf3f1;border-radius:10px;font-size:14px;line-height:1.85;color:#7a4a3a;'
const SIGN = 'margin:26px 0 0;text-align:right;font-size:15px;line-height:2;color:#5c5f64;'

function p(text) {
  return '<p style="' + P + '">' + text + '</p>'
}
function h(text) {
  return '<h4 style="' + H + '">' + text + '</h4>'
}
function note(text) {
  return '<div style="' + NOTE + '">' + text + '</div>'
}
function sign(text) {
  return '<p style="' + SIGN + '">' + text + '</p>'
}

const village = {
  id: '22022110001',
  name: '新源村',
  fullName: '吉林省吉林市永吉县 · 口前镇新源村',
  gridName: '第三网格',
  regionPath: ['永吉县', '口前镇', '新源村'],
  gridWorker: {
    name: '李建国',
    phoneDisplay: '138****9072',
    phone: '13843219072',
    duty: '周一至周五 10:00—19:30'
  },
  households: 486,
  population: 1632,
  partyMembers: 41
}

const regionTree = [{
  id: '220221',
  name: '永吉县',
  level: 1,
  children: [{
    id: '220221100',
    name: '口前镇',
    level: 2,
    children: [{
      id: '22022110001',
      name: '新源村',
      level: 3,
      grid: '第三网格',
      status: 'online'
    }, {
      id: '22022110002',
      name: '幸福村',
      level: 3,
      grid: '第一网格',
      status: 'preparing'
    }, {
      id: '22022110003',
      name: '团结村',
      level: 3,
      grid: '第二网格',
      status: 'preparing'
    }, {
      id: '22022110004',
      name: '光明村',
      level: 3,
      grid: '第一网格',
      status: 'preparing'
    }]
  }, {
    id: '220221200',
    name: '岔路河镇',
    level: 2,
    children: [{
      id: '22022120001',
      name: '岔路河村',
      level: 3,
      grid: '第一网格',
      status: 'preparing'
    }]
  }]
}]

const user = {
  id: 'u1001',
  name: '王秀兰',
  nickname: '王秀兰',
  roleCode: 'villager',
  roleName: '村民',
  phone: '13843216621',
  phoneDisplay: '138****6621',
  avatarText: '王',
  regionId: '22022110001',
  regionName: '新源村',
  gridName: '第三网格',
  regionPath: ['永吉县', '口前镇', '新源村'],
  houseNo: '三组 26 号',
  joinedAt: '2025-03-18',
  isVerified: true,
  stats: {
    applies: 3,
    appeals: 2,
    ratings: 2
  }
}

const columns = [{
  id: 'c1',
  code: 'village_news',
  name: '村情动态',
  shortName: '动态',
  color: '#C4161C',
  description: '村里发生的事，第一时间知道',
  sort: 1
}, {
  id: 'c2',
  code: 'three_affairs',
  name: '三务公开',
  shortName: '公开',
  color: '#B3202A',
  description: '党务、村务、财务，阳光公开',
  sort: 2
}, {
  id: 'c3',
  code: 'folk_culture',
  name: '乡风纪实',
  shortName: '乡风',
  color: '#E8641B',
  description: '身边好人好事，记录文明乡风',
  sort: 3
}, {
  id: 'c4',
  code: 'policy_express',
  name: '政策速递',
  shortName: '政策',
  color: '#BE8430',
  description: '惠农政策，讲清楚、说明白',
  sort: 4
}]

const articles = [{
  id: 'a1001',
  columnId: 'c1',
  title: '关于2026年度城乡居民基本医疗保险集中缴费的通知',
  summary: '个人缴费380元/人·年，集中缴费期至12月31日，逾期将影响明年医保待遇。',
  isTop: true,
  publishedAt: '2026-11-12 09:00',
  views: 428,
  likes: 36,
  source: '新源村党群服务中心',
  author: '村医保专干 刘芳',
  content: [
    p('各位村民：'),
    p('根据永吉县医疗保障局、税务局统一安排，2026年度城乡居民基本医疗保险集中缴费工作已经开始。为避免影响您和家人明年的医保报销，请在规定时间内完成缴费。'),
    h('一、缴费标准'),
    p('2026年度城乡居民基本医疗保险个人缴费标准为 <strong style="color:#c4161c;">380元/人·年</strong>。特困人员、低保对象、脱贫人口等困难群体按政策享受分类资助，具体以县医保局核定为准。'),
    h('二、集中缴费时间'),
    p('2026年9月1日至 <strong>2026年12月31日</strong>。逾期缴费将设置待遇等待期，等待期内发生的医疗费用不能报销。'),
    h('三、缴费方式'),
    p('1. 微信搜索“吉林税务社保缴费”小程序，按提示输入姓名、身份证号完成缴费；'),
    p('2. 持身份证或户口簿到县域内农业银行、农商银行网点柜台缴费；'),
    p('3. 不会使用手机的老人，可到村党群服务中心 1 号窗口，由工作人员协助代收代缴。'),
    h('四、注意事项'),
    p('新参保、断保人员需先到村党群服务中心完成参保登记，再办理缴费；新生儿出生后 90 天内参保，可自出生之日起享受待遇。'),
    note('温馨提示：缴费成功后请保留电子凭证。3 个工作日后可在“吉林医保”小程序查询缴费到账情况。如有疑问，请拨打村党群服务中心电话 0432-64216888，或医保服务热线 12393。'),
    sign('新源村村民委员会<br/>2026年11月12日')
  ].join('')
}, {
  id: 'a1002',
  columnId: 'c2',
  title: '新源村2026年第三季度村级财务收支公开',
  summary: '三季度村集体收入18.6万元、支出15.2万元，结余3.4万元，明细同步张贴在村务公开栏。',
  isTop: false,
  publishedAt: '2026-11-10 17:30',
  views: 216,
  likes: 18,
  source: '新源村村务监督委员会',
  author: '村务监督委员会',
  content: [
    p('根据《中华人民共和国村民委员会组织法》和村务公开有关规定，现将新源村2026年第三季度村级财务收支情况公开如下，接受全体村民监督。'),
    h('一、收入情况（合计 18.6 万元）'),
    p('1. 村集体土地租赁收入：8.4 万元；<br/>2. 上级帮扶资金：6.2 万元；<br/>3. 其他收入（场地使用、利息等）：4.0 万元。'),
    h('二、支出情况（合计 15.2 万元）'),
    p('1. 村组道路维修：5.6 万元；<br/>2. 人居环境整治：3.8 万元；<br/>3. 村级组织办公经费：1.9 万元；<br/>4. 困难群众慰问：2.1 万元；<br/>5. 其他支出：1.8 万元。'),
    h('三、结余情况'),
    p('本季度收支结余 3.4 万元，已存入村集体账户，纳入下季度预算管理。'),
    note('公开时间：2026年11月10日至11月17日。公开地点：村党群服务中心一楼公开栏、村民微信群。如对收支有疑问，请在公示期内向村务监督委员会反映，监督电话：0432-64216888。'),
    sign('新源村村务监督委员会<br/>2026年11月10日')
  ].join('')
}, {
  id: 'a1003',
  columnId: 'c3',
  title: '“助农直播”走进新源村：一下午卖出1.2万斤苹果',
  summary: '青年志愿队帮果农直播带货，线上线下联动，解了苹果滞销的燃眉之急。',
  isTop: false,
  publishedAt: '2026-11-08 20:10',
  views: 189,
  likes: 42,
  source: '新源村新时代文明实践站',
  author: '通讯员 马晓燕',
  content: [
    p('“家人们看，这是我们新源村刚下树的红富士，脆甜多汁，今天下单明天发货！”11月7日下午，村党群服务中心院子里架起了补光灯和手机支架，一场助农直播正在进行。'),
    p('今年村里苹果丰收，但部分果农缺少销售渠道。村新时代文明实践站联合镇团委，组织 8 名青年志愿者走进果园和农户家中，用直播的方式帮乡亲们卖苹果。'),
    h('线上线下一起发力'),
    p('直播持续 3 个多小时，累计观看 2.6 万人次，成交 1860 单，卖出苹果 1.2 万斤。志愿者还帮 12 户果农注册了线上店铺，教会他们自己上架商品。'),
    h('把“流量”变成“留量”'),
    p('“卖一次不算本事，关键是让乡亲们学会自己卖。”志愿者服务队负责人说，接下来将每月组织一次电商培训，帮助更多农户掌握手机“新农具”。'),
    note('目前村里仍有少量晚熟苹果待售，有需要的村民和爱心企业可联系村党群服务中心：0432-64216888。'),
    sign('新源村新时代文明实践站<br/>2026年11月8日')
  ].join('')
}, {
  id: 'a1004',
  columnId: 'c2',
  title: '关于发放2026年耕地地力保护补贴的公示',
  summary: '涉及286户、耕地3120亩，补贴标准95元/亩，公示期7天，如有异议请及时反馈。',
  isTop: false,
  publishedAt: '2026-11-06 10:20',
  views: 154,
  likes: 9,
  source: '新源村村民委员会',
  author: '村农经员 张建军',
  content: [
    p('根据永吉县农业农村局、财政局《关于做好2026年耕地地力保护补贴发放工作的通知》要求，现将我村补贴发放情况公示如下。'),
    h('一、补贴范围'),
    p('全村 286 户、耕地 3120 亩，补贴标准为 95 元/亩，合计发放 29.64 万元。'),
    h('二、发放方式'),
    p('补贴资金通过“一卡通”直接发放到户，请各户核对姓名、身份证号、银行卡号是否准确。'),
    h('三、公示时间'),
    p('2026年11月6日至11月12日，共 7 天。公示表张贴在村党群服务中心公开栏，也可到村委会查询。'),
    note('对公示内容有异议的，请在公示期内携带土地承包经营权证、身份证到村委会核对，或拨打监督电话 0432-64216888。逾期未提出异议的，视为无异议。'),
    sign('新源村村民委员会<br/>2026年11月6日')
  ].join('')
}, {
  id: 'a1005',
  columnId: 'c3',
  title: '新源村“好婆婆·好媳妇·好邻居”评选结果揭晓',
  summary: '12位村民上榜，村里敲锣打鼓把荣誉送到家，用身边人讲好身边事。',
  isTop: false,
  publishedAt: '2026-11-03 16:40',
  views: 167,
  likes: 31,
  source: '新源村妇联',
  author: '村妇联主席 王丽华',
  content: [
    p('经过村民推荐、网格初评、村“两委”审议和为期 5 天的公示，新源村2026年度“好婆婆·好媳妇·好邻居”评选结果正式揭晓，12 位村民获得荣誉。'),
    h('评选结果'),
    p('好婆婆：张桂兰、马秀英、王凤霞；<br/>好媳妇：李春梅、赵丽娜、刘晓芳；<br/>好邻居：赵大山、孙德福、陈玉兰；<br/>文明家庭：王秀兰家庭、刘志强家庭、周建国家庭。'),
    h('把荣誉送到家门口'),
    p('11月2日，村“两委”和妇联敲锣打鼓，把证书和奖品送到获奖者家中。好媳妇李春梅说：“照顾老人是应该的，没想到村里还记着。”'),
    p('评选不是目的，向身边人学习才是。希望大家从自家做起、从邻里做起，让新源村更有人情味。'),
    sign('新源村妇联<br/>2026年11月3日')
  ].join('')
}, {
  id: 'a1006',
  columnId: 'c4',
  title: '2027年度城乡居民基本养老保险参保缴费指南',
  summary: '12个缴费档次200—3000元，多缴多得、长缴多得，政府按档次给予补贴。',
  isTop: false,
  publishedAt: '2026-10-30 11:15',
  views: 302,
  likes: 25,
  source: '永吉县人力资源和社会保障局',
  author: '县社保中心',
  content: [
    p('2027年度城乡居民基本养老保险参保缴费工作已启动。为方便村民了解政策，现将缴费档次、补贴标准和待遇领取条件说明如下。'),
    h('一、参保范围'),
    p('年满 16 周岁（不含在校学生），具有永吉县户籍，未参加职工基本养老保险的城乡居民。'),
    h('二、缴费档次'),
    p('每人每年 200 元、300 元、500 元、800 元、1000 元、1500 元、2000 元、2500 元、3000 元等 12 个档次，参保人自主选择，多缴多得。'),
    h('三、政府补贴'),
    p('按缴费档次给予相应补贴，补贴资金计入个人账户。选择 500 元以上档次的，补贴标准更高。'),
    h('四、待遇领取'),
    p('年满 60 周岁、累计缴费满 15 年，可按月领取养老金。养老金由基础养老金和个人账户养老金组成，终身领取。'),
    note('缴费请通过“吉林税务社保缴费”小程序或到村党群服务中心办理。具体档次和补贴金额以县社保中心当年公布为准，咨询电话：12333。'),
    sign('永吉县社会保险中心<br/>2026年10月30日')
  ].join('')
}, {
  id: 'a1007',
  columnId: 'c1',
  title: '冬季取暖安全提示：谨防一氧化碳中毒',
  summary: '用煤炉取暖务必保持通风，建议安装一氧化碳报警器，出现头晕恶心立即开窗撤离。',
  isTop: false,
  publishedAt: '2026-10-28 09:30',
  views: 233,
  likes: 14,
  source: '新源村新时代文明实践站',
  author: '村安全员 李强',
  content: [
    p('天气转冷，村里部分家庭开始用煤炉、炭火取暖。每年冬季都是一氧化碳中毒的高发期，请大家务必注意安全。'),
    h('这些情况最危险'),
    p('1. 在密闭房间内使用煤炉、炭盆取暖；<br/>2. 烟囱堵塞、倒风或接口不严；<br/>3. 停车后长时间在车内开空调休息。'),
    h('记住四个“一定要”'),
    p('一定要保持室内通风，睡觉前检查炉火；一定要安装合格的一氧化碳报警器；一定要定期清理烟囱；一定要教会老人和孩子识别中毒症状。'),
    h('发现中毒怎么办'),
    p('立即打开门窗通风，迅速将人转移到空气新鲜处，解开衣领、保持呼吸道通畅，并拨打 120 急救电话。不要在现场开灯、打电话或使用明火，以免引发爆炸。'),
    note('如家中没有一氧化碳报警器，可到村党群服务中心登记，村里将协调统一采购。联系电话：0432-64216888。'),
    sign('新源村新时代文明实践站<br/>2026年10月28日')
  ].join('')
}, {
  id: 'a1008',
  columnId: 'c1',
  title: '新源村党群服务中心11月值班表',
  summary: '工作日10:00—13:30、15:30—19:30；周末及节假日可提前预约，急事请打电话。',
  isTop: false,
  publishedAt: '2026-10-31 18:00',
  views: 98,
  likes: 5,
  source: '新源村党群服务中心',
  author: '村综合办',
  content: [
    p('为方便村民办事，现将新源村党群服务中心11月值班安排公布如下。'),
    h('值班时间'),
    p('周一至周五：10:00—13:30，15:30—19:30；<br/>周六、周日：预约服务（请提前一天电话预约）。'),
    h('窗口分工'),
    p('1号窗口：医保、养老、社保咨询；<br/>2号窗口：民政、残联、高龄补贴；<br/>3号窗口：计生、户籍、证明事项；<br/>综合窗口：诉求登记、矛盾调解、政策咨询。'),
    h('值班电话'),
    p('0432-64216888（工作时间）；13843219072（网格员李建国，24小时应急）。'),
    note('如遇紧急情况，请直接拨打 110、120 或 119。行动不便的老人可联系网格员上门代办。'),
    sign('新源村党群服务中心<br/>2026年10月31日')
  ].join('')
}, {
  id: 'a1009',
  columnId: 'c4',
  title: '独生子女父母光荣证办理须知',
  summary: '符合条件的夫妻可到村党群服务中心代办，材料齐全5个工作日办结。',
  isTop: false,
  publishedAt: '2026-10-25 15:10',
  views: 276,
  likes: 21,
  source: '永吉县卫生健康委员会',
  author: '县卫健委',
  content: [
    p('近期不少村民咨询独生子女父母光荣证的办理条件。现将有关事项说明如下，符合条件的可到村党群服务中心提交材料，由村里统一代办。'),
    h('一、办理条件'),
    p('1. 夫妻双方或一方具有永吉县户籍；<br/>2. 2016年1月1日之前生育一个子女，且自愿终身只生育一个子女；<br/>3. 子女未满 18 周岁，或已满 18 周岁但父母未再生育、未收养子女。'),
    h('二、所需材料'),
    p('夫妻双方身份证、户口簿、结婚证、子女出生医学证明、近期免冠照片各 2 张。再婚家庭需提供离婚协议或判决书。'),
    h('三、办理时限'),
    p('材料齐全的，5 个工作日内办结。证件可到村党群服务中心领取，也可申请邮寄到家。'),
    note('2016年1月1日之后生育第一个子女的夫妻，不再办理独生子女父母光荣证。具体政策以县卫健委解释为准，咨询电话：12356。'),
    sign('永吉县卫生健康委员会<br/>2026年10月25日')
  ].join('')
}, {
  id: 'a1010',
  columnId: 'c1',
  title: '新源村高标准农田建设项目施工公告',
  summary: '11月15日起对三组、四组渠系进行改造，施工期间请绕行，注意安全。',
  isTop: false,
  publishedAt: '2026-11-11 08:40',
  views: 121,
  likes: 6,
  source: '新源村村民委员会',
  author: '村项目办',
  content: [
    p('为改善农田灌溉条件，经县农业农村局批准，我村高标准农田建设项目将于近期开工。现将有关事项公告如下。'),
    h('一、施工范围'),
    p('三组、四组斗渠及附属建筑物，全长约 3.2 公里。'),
    h('二、施工时间'),
    p('2026年11月15日至2027年4月30日。如遇极端天气顺延。'),
    h('三、注意事项'),
    p('施工期间部分田间道路封闭，请村民绕行，不要进入围挡区域；看管好老人和儿童；农机作业请提前与施工方沟通。'),
    note('施工给您带来不便，敬请谅解。对施工质量、进度有意见或建议，请联系村项目办：0432-64216888。'),
    sign('新源村村民委员会<br/>2026年11月11日')
  ].join('')
}]

const banner = {
  id: 'b1',
  tag: '医保征缴',
  title: '2026年度城乡居民医保',
  titleHighlight: '集中缴费开始了',
  subtitle: '手机可缴 · 村部也可代收',
  meta: '截止 12 月 31 日 · 逾期影响待遇',
  actionText: '查看缴费指南',
  articleId: 'a1001',
  theme: 'red'
}

const notice = {
  id: 'n1',
  text: '2026年度城乡居民医保集中缴费将于12月31日截止',
  type: 'urgent',
  articleId: 'a1001'
}

const modules = [{
  id: 'm1',
  code: 'consult',
  name: '咨询帮办',
  desc: '有事您说话',
  icon: '/assets/icons/grid-consult.png',
  tint: '#FBE9E9',
  route: '/pages/request/create?type=consult',
  status: 'online',
  badge: '',
  version: 'V2'
}, {
  id: 'm2',
  code: 'appeal',
  name: '诉求建议',
  desc: '件件有回音',
  icon: '/assets/icons/grid-advice.png',
  tint: '#FDF0E8',
  route: '/pages/request/create?type=appeal',
  status: 'online',
  badge: '',
  version: 'V2'
}, {
  id: 'm3',
  code: 'tea_meeting',
  name: '线上奶茶会',
  desc: '议村里的事',
  icon: '/assets/icons/grid-tea.png',
  tint: '#FAF3E3',
  route: '/pages/service/index?tab=tea',
  status: 'online',
  badge: '',
  version: 'V2'
}, {
  id: 'm4',
  code: 'directory',
  name: '服务黄页',
  desc: '水电气暖电话',
  icon: '/assets/icons/grid-directory.png',
  tint: '#F8EAEA',
  route: '/pages/service/index?tab=directory',
  status: 'online',
  badge: '',
  version: 'V2'
}, {
  id: 'm5',
  code: 'gov',
  name: '政务管理',
  desc: '4 类事项可办',
  icon: '/assets/icons/grid-gov.png',
  tint: '#C4161C',
  route: '/pages/gov/index',
  status: 'online',
  badge: '4 类',
  version: 'V1',
  highlight: true
}, {
  id: 'm6',
  code: 'jobs',
  name: '就业招聘',
  desc: '家门口找工作',
  icon: '/assets/icons/grid-jobs.png',
  tint: '#F9EDE9',
  route: '/pages/service/index?tab=jobs',
  status: 'online',
  badge: '',
  version: 'V2'
}]

const govCategories = [{
  id: 'all',
  code: 'all',
  name: '全部事项',
  desc: '四类高频事项'
}, {
  id: 'social',
  code: 'social',
  name: '社会保障',
  desc: '医保、养老、高龄补贴'
}, {
  id: 'medical',
  code: 'medical',
  name: '医疗卫生',
  desc: '出生证明、健康服务'
}, {
  id: 'family',
  code: 'family',
  name: '人口计生',
  desc: '独生子女、生育登记'
}, {
  id: 'employment',
  code: 'employment',
  name: '就业创业',
  desc: '就业登记、创业扶持'
}]

const govItems = [{
  id: 'g1',
  code: 'YB001',
  categoryId: 'social',
  categoryName: '社会保障',
  name: '城乡居民基本医疗保险参保缴费',
  shortName: '医保缴费',
  summary: '个人缴费 380 元，集中缴费期至 12 月 31 日，支持线上、银行、村部代收。',
  icon: '医',
  iconTint: '#FBE9E9',
  tags: ['线上可办', '材料 2 项', '承诺 1 天'],
  target: '本村户籍居民及常住人口',
  promiseDays: 1,
  fee: '380 元/人·年（资助对象按政策减免）',
  phone: '0432-64216888',
  address: '新源村党群服务中心 1 号窗口',
  updateAt: '2026-11-12',
  conditions: [
    '具有本村户籍，或持有本地居住证且在本村常住',
    '未参加职工基本医疗保险',
    '新参保、断保人员需先完成参保登记'
  ],
  materials: [{
    name: '身份证或户口簿',
    required: true,
    note: '原件核验，复印件 1 份'
  }, {
    name: '居住证（非本村户籍）',
    required: false,
    note: '常住人口提供'
  }, {
    name: '本人银行卡',
    required: false,
    note: '用于签订代扣协议，可选'
  }],
  steps: [{
    title: '参保登记',
    desc: '携带身份证或户口簿到村党群服务中心登记，已参保人员可跳过'
  }, {
    title: '选择缴费方式',
    desc: '微信小程序、银行网点或村部代收'
  }, {
    title: '确认缴费信息',
    desc: '核对姓名、身份证号、参保年度和人员类别'
  }, {
    title: '完成缴费',
    desc: '缴费成功后保留电子凭证或银行回单'
  }, {
    title: '查询到账',
    desc: '3 个工作日后可在“吉林医保”小程序查询'
  }],
  formFields: [{
    label: '参保人姓名',
    type: 'text',
    placeholder: '请输入参保人姓名',
    required: true
  }, {
    label: '身份证号',
    type: 'idcard',
    placeholder: '请输入 18 位身份证号',
    required: true
  }, {
    label: '参保年度',
    type: 'select',
    options: ['2026 年度'],
    required: true
  }, {
    label: '人员类别',
    type: 'radio',
    options: ['普通居民', '低保对象', '特困人员', '脱贫人口'],
    required: true
  }, {
    label: '联系电话',
    type: 'text',
    placeholder: '用于接收办理进度',
    required: true
  }],
  basis: [
    '《吉林省城乡居民基本医疗保险实施办法》',
    '《永吉县2026年度城乡居民基本医疗保险参保缴费通告》'
  ],
  faqs: [{
    q: '错过集中缴费期还能补缴吗？',
    a: '可以补缴，但会设置待遇等待期，等待期内发生的医疗费用不能报销。建议在 12 月 31 日前完成。'
  }, {
    q: '老人不会用手机怎么办？',
    a: '可携带身份证或户口簿到村党群服务中心 1 号窗口，由工作人员协助代收代缴；行动不便的可联系网格员上门。'
  }]
}, {
  id: 'g2',
  code: 'YL002',
  categoryId: 'social',
  categoryName: '社会保障',
  name: '城乡居民基本养老保险参保缴费',
  shortName: '养老保险',
  summary: '12 个缴费档次 200—3000 元，多缴多得、长缴多得，政府按档次补贴。',
  icon: '养',
  iconTint: '#FDF0E8',
  tags: ['线上可办', '材料 2 项', '承诺 1 天'],
  target: '年满 16 周岁、未参加职工养老保险的本村户籍居民',
  promiseDays: 1,
  fee: '200—3000 元/年，自主选择档次',
  phone: '0432-64216888',
  address: '新源村党群服务中心 1 号窗口',
  updateAt: '2026-10-30',
  conditions: [
    '年满 16 周岁（不含在校学生）',
    '具有永吉县户籍',
    '未参加城镇职工基本养老保险'
  ],
  materials: [{
    name: '身份证或户口簿',
    required: true,
    note: '原件核验'
  }, {
    name: '本人银行卡',
    required: true,
    note: '用于签订代扣协议'
  }],
  steps: [{
    title: '选择缴费档次',
    desc: '根据家庭情况选择 200—3000 元之间的档次'
  }, {
    title: '参保登记',
    desc: '首次参保到村党群服务中心登记个人信息'
  }, {
    title: '签订代扣协议',
    desc: '绑定本人银行卡，或选择每年手动缴费'
  }, {
    title: '完成缴费',
    desc: '通过小程序、银行或村部完成缴费'
  }, {
    title: '查询个人账户',
    desc: '可在“吉林智慧人社”小程序查询缴费记录'
  }],
  formFields: [{
    label: '参保人姓名',
    type: 'text',
    placeholder: '请输入参保人姓名',
    required: true
  }, {
    label: '身份证号',
    type: 'idcard',
    placeholder: '请输入 18 位身份证号',
    required: true
  }, {
    label: '缴费档次',
    type: 'select',
    options: ['200 元', '300 元', '400 元', '500 元', '600 元', '800 元', '1000 元', '1200 元', '1500 元', '2000 元', '2500 元', '3000 元'],
    required: true
  }, {
    label: '联系电话',
    type: 'text',
    placeholder: '用于接收办理进度',
    required: true
  }],
  basis: [
    '《吉林省城乡居民基本养老保险实施办法》',
    '《永吉县2027年度城乡居民基本养老保险参保缴费通知》'
  ],
  faqs: [{
    q: '缴满 15 年还要继续缴吗？',
    a: '缴满 15 年是最低年限，继续缴费可增加个人账户积累，退休后领取的养老金更高。'
  }]
}, {
  id: 'g3',
  code: 'GJ003',
  categoryId: 'social',
  categoryName: '社会保障',
  name: '高龄老人生活津贴申领',
  shortName: '高龄补贴',
  summary: '80 周岁以上老人可按月领取津贴，需提供身份证、户口簿和银行卡。',
  icon: '龄',
  iconTint: '#FAF3E3',
  tags: ['村部代办', '材料 4 项', '承诺 7 天'],
  target: '年满 80 周岁、具有本村户籍的老年人',
  promiseDays: 7,
  fee: '免费',
  phone: '0432-64216888',
  address: '新源村党群服务中心 2 号窗口',
  updateAt: '2026-10-20',
  conditions: [
    '年满 80 周岁',
    '具有永吉县户籍',
    '未享受同类高龄津贴'
  ],
  materials: [{
    name: '身份证',
    required: true,
    note: '原件及复印件 2 份'
  }, {
    name: '户口簿',
    required: true,
    note: '首页及本人页复印件'
  }, {
    name: '本人银行卡',
    required: true,
    note: '用于按月发放'
  }, {
    name: '近期免冠照片',
    required: true,
    note: '1 寸 2 张'
  }],
  steps: [{
    title: '提交申请',
    desc: '本人或家属到村党群服务中心提交材料'
  }, {
    title: '村级初审',
    desc: '村委会核实年龄、户籍和享受情况'
  }, {
    title: '乡镇审核',
    desc: '乡镇民政办复核并公示 5 天'
  }, {
    title: '县级审批',
    desc: '县民政局审批后按月发放'
  }],
  formFields: [{
    label: '老人姓名',
    type: 'text',
    placeholder: '请输入老人姓名',
    required: true
  }, {
    label: '身份证号',
    type: 'idcard',
    placeholder: '请输入 18 位身份证号',
    required: true
  }, {
    label: '出生日期',
    type: 'date',
    placeholder: '请选择出生日期',
    required: true
  }, {
    label: '银行卡号',
    type: 'text',
    placeholder: '请输入本人银行卡号',
    required: true
  }],
  basis: ['《永吉县高龄老人生活津贴发放管理办法》'],
  faqs: [{
    q: '老人行动不便，能上门办理吗？',
    a: '可以。请联系第三网格网格员李建国 13843219072，预约上门采集信息。'
  }]
}, {
  id: 'g4',
  code: 'DZ004',
  categoryId: 'family',
  categoryName: '人口计生',
  name: '独生子女父母光荣证核发',
  shortName: '独生子女证',
  summary: '2016 年前生育一个子女的夫妻可申请，材料齐全 5 个工作日办结。',
  icon: '计',
  iconTint: '#F8EAEA',
  tags: ['村部代办', '材料 5 项', '承诺 5 天'],
  target: '符合政策的本村户籍夫妻',
  promiseDays: 5,
  fee: '免费',
  phone: '0432-64216888',
  address: '新源村党群服务中心 3 号窗口',
  updateAt: '2026-10-25',
  conditions: [
    '夫妻双方或一方具有永吉县户籍',
    '2016 年 1 月 1 日之前生育一个子女，且自愿终身只生育一个子女',
    '子女未满 18 周岁，或已满 18 周岁但父母未再生育、未收养子女'
  ],
  materials: [{
    name: '夫妻双方身份证',
    required: true,
    note: '原件及复印件'
  }, {
    name: '户口簿',
    required: true,
    note: '首页及本人页'
  }, {
    name: '结婚证',
    required: true,
    note: '再婚家庭提供离婚协议或判决书'
  }, {
    name: '子女出生医学证明',
    required: true,
    note: '原件及复印件'
  }, {
    name: '免冠照片',
    required: true,
    note: '夫妻双方各 2 张'
  }],
  steps: [{
    title: '提交材料',
    desc: '到村党群服务中心 3 号窗口提交，填写申请表'
  }, {
    title: '村级初审',
    desc: '村委会核实婚育情况并公示 5 天'
  }, {
    title: '乡镇复核',
    desc: '乡镇卫健办复核材料'
  }, {
    title: '县级发证',
    desc: '县卫健委制证，村里代领后通知领取'
  }],
  formFields: [{
    label: '申请人姓名',
    type: 'text',
    placeholder: '请输入申请人姓名',
    required: true
  }, {
    label: '身份证号',
    type: 'idcard',
    placeholder: '请输入 18 位身份证号',
    required: true
  }, {
    label: '结婚登记日期',
    type: 'date',
    placeholder: '请选择结婚登记日期',
    required: true
  }, {
    label: '子女姓名',
    type: 'text',
    placeholder: '请输入子女姓名',
    required: true
  }, {
    label: '子女出生日期',
    type: 'date',
    placeholder: '请选择子女出生日期',
    required: true
  }],
  basis: [
    '《中华人民共和国人口与计划生育法》',
    '《吉林省人口与计划生育条例》'
  ],
  faqs: [{
    q: '2016 年以后出生的孩子还能办吗？',
    a: '不能。2016 年 1 月 1 日之后生育第一个子女的夫妻，不再办理独生子女父母光荣证。'
  }]
}, {
  id: 'g5',
  code: 'CS005',
  categoryId: 'medical',
  categoryName: '医疗卫生',
  name: '出生医学证明首次签发',
  shortName: '出生证明',
  summary: '新生儿出生后由分娩医院签发，需提供父母身份证、结婚证等材料。',
  icon: '生',
  iconTint: '#FBE9E9',
  tags: ['医院办理', '材料 4 项', '承诺 1 天'],
  target: '在本县助产机构分娩的新生儿',
  promiseDays: 1,
  fee: '免费',
  phone: '0432-64216888',
  address: '永吉县人民医院产科（出生证明窗口）',
  updateAt: '2026-10-18',
  conditions: [
    '新生儿在本县助产机构出生',
    '父母双方身份信息真实、完整',
    '原则上由母亲本人办理；父亲代办需提供授权委托书'
  ],
  materials: [{
    name: '父母双方身份证',
    required: true,
    note: '原件及复印件'
  }, {
    name: '结婚证',
    required: true,
    note: '原件及复印件'
  }, {
    name: '出生医学证明首次签发登记表',
    required: true,
    note: '分娩医院提供'
  }, {
    name: '授权委托书',
    required: false,
    note: '父亲代办时提供'
  }],
  steps: [{
    title: '确定新生儿姓名',
    desc: '出生证明一经签发，姓名不予更改，请提前确定'
  }, {
    title: '准备材料',
    desc: '父母身份证、结婚证、登记表'
  }, {
    title: '到院办理',
    desc: '到分娩医院出生证明窗口提交材料'
  }, {
    title: '领取证件',
    desc: '材料齐全当场签发，妥善保管'
  }],
  formFields: [{
    label: '新生儿姓名',
    type: 'text',
    placeholder: '请输入新生儿姓名',
    required: true
  }, {
    label: '出生日期',
    type: 'date',
    placeholder: '请选择出生日期',
    required: true
  }, {
    label: '母亲姓名',
    type: 'text',
    placeholder: '请输入母亲姓名',
    required: true
  }, {
    label: '父亲姓名',
    type: 'text',
    placeholder: '请输入父亲姓名',
    required: true
  }],
  basis: ['《出生医学证明管理办法》'],
  faqs: [{
    q: '出生证明丢了能补办吗？',
    a: '可以到原签发机构申请补发，需提供父母身份证、户口簿及书面申请，具体以医院要求为准。'
  }]
}, {
  id: 'g6',
  code: 'JY006',
  categoryId: 'employment',
  categoryName: '就业创业',
  name: '就业失业登记证办理',
  shortName: '就业登记',
  summary: '用于享受就业扶持政策、申请创业担保贷款，材料齐全 3 个工作日办结。',
  icon: '业',
  iconTint: '#F9EDE9',
  tags: ['村部代办', '材料 4 项', '承诺 3 天'],
  target: '法定劳动年龄内有就业意愿的本村居民',
  promiseDays: 3,
  fee: '免费',
  phone: '0432-64216888',
  address: '新源村党群服务中心 1 号窗口',
  updateAt: '2026-10-12',
  conditions: [
    '年满 16 周岁、未达到法定退休年龄',
    '有劳动能力和就业意愿',
    '具有本村户籍或持有本地居住证'
  ],
  materials: [{
    name: '身份证',
    required: true,
    note: '原件及复印件'
  }, {
    name: '户口簿',
    required: true,
    note: '首页及本人页'
  }, {
    name: '免冠照片',
    required: true,
    note: '2 寸 2 张'
  }, {
    name: '失业证明或解除劳动关系证明',
    required: false,
    note: '有工作经历者提供'
  }],
  steps: [{
    title: '提交申请',
    desc: '到村党群服务中心填写就业失业登记表'
  }, {
    title: '村级受理',
    desc: '核实身份和就业状态'
  }, {
    title: '乡镇审核',
    desc: '乡镇劳动保障所审核'
  }, {
    title: '领取证件',
    desc: '3 个工作日后到村部领取'
  }],
  formFields: [{
    label: '姓名',
    type: 'text',
    placeholder: '请输入姓名',
    required: true
  }, {
    label: '身份证号',
    type: 'idcard',
    placeholder: '请输入 18 位身份证号',
    required: true
  }, {
    label: '文化程度',
    type: 'select',
    options: ['初中及以下', '高中/中专', '大专', '本科及以上'],
    required: true
  }, {
    label: '就业状态',
    type: 'radio',
    options: ['失业', '灵活就业', '自主创业'],
    required: true
  }],
  basis: ['《就业失业登记证管理办法》', '《吉林省就业促进条例》'],
  faqs: [{
    q: '这个证有什么用？',
    a: '可用于申请就业培训补贴、创业担保贷款、社保补贴等就业扶持政策，具体以县人社局公布为准。'
  }]
}]

const suggestions = [{
  id: 's1',
  text: '今年医保怎么缴？',
  icon: '💊'
}, {
  id: 's2',
  text: '独生子女证需要什么材料？',
  icon: '📄'
}, {
  id: 's3',
  text: '养老缴费有哪些档次？',
  icon: '🧾'
}, {
  id: 's4',
  text: '高龄补贴怎么申请？',
  icon: '👵'
}]

const footer = {
  organizer: '中共永吉县委组织部',
  coOrganizer: '新源村村民委员会',
  reportPhone: '12380',
  hotline: '0432-64216888',
  icp: '吉ICP备2026001234号-1',
  serviceTime: '周一至周五 10:00—19:30',
  disclaimer: '本平台内容由新源村党群服务中心提供，AI 回答仅供参考，具体以官方发布为准。',
  version: 'V1.1.0'
}

const appConfig = {
  appName: '新源村情通',
  slogan: '听民意 · 解民忧 · 暖民心',
  footer: footer,
  features: {
    onlineApply: true,
    aiStream: true,
    voiceInput: false,
    familyMembers: false
  },
  aiDisclaimer: 'AI 生成内容仅供参考，具体政策以官方发布为准。',
  aiWelcome: '您好，我是新源村 AI 网格员“小贾”。医保缴费、养老参保、独生子女证、高龄补贴……村里的事都可以问我，我会尽量给出政策依据；查不到的我也会直说。',
  hotline: footer.hotline
}

const applyStatusLabels = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  ACCEPTED: '已受理',
  SUPPLEMENT: '待补正',
  APPROVED: '已核准',
  PAID: '已缴费',
  COMPLETED: '已办结',
  REJECTED: '已驳回',
  CANCELED: '已撤销'
}

const requestStatusLabels = {
  PENDING: '待受理',
  ACCEPTED: '已受理',
  PROCESSING: '办理中',
  COMPLETED: '已办结',
  CLOSED: '已关闭',
  RATED: '已评价'
}

const seedApplies = [{
  id: 'ap_seed_1',
  applyNo: 'SB202611130001',
  itemCode: 'YB001',
  itemName: '城乡居民基本医疗保险参保缴费',
  itemShortName: '医保缴费',
  status: 'SUBMITTED',
  amount: 38000,
  createdAt: '2026-11-13 10:20',
  promiseAt: '2026-11-16 19:30',
  rating: 0,
  formData: {
    参保人姓名: '王秀兰',
    身份证号: '220221********002X',
    参保年度: '2026 年度',
    人员类别: '普通居民',
    联系电话: '138****6621'
  },
  materials: [{
    name: '身份证或户口簿',
    required: true,
    uploaded: true
  }, {
    name: '居住证（非本村户籍）',
    required: false,
    uploaded: false
  }, {
    name: '本人银行卡',
    required: false,
    uploaded: false
  }],
  logs: [{
    status: 'SUBMITTED',
    label: '已提交',
    time: '2026-11-13 10:20',
    operator: '王秀兰',
    note: '提交医保缴费申请，等待受理'
  }]
}, {
  id: 'ap_seed_2',
  applyNo: 'SB202611050002',
  itemCode: 'GJ003',
  itemName: '高龄老人生活津贴申领',
  itemShortName: '高龄补贴',
  status: 'COMPLETED',
  amount: 0,
  createdAt: '2026-11-05 09:10',
  promiseAt: '2026-11-12 19:30',
  rating: 0,
  formData: {
    老人姓名: '王秀兰',
    身份证号: '220221********002X',
    出生日期: '1944-08-16',
    银行卡号: '6228 **** **** 6621'
  },
  materials: [{
    name: '身份证',
    required: true,
    uploaded: true
  }, {
    name: '户口簿',
    required: true,
    uploaded: true
  }, {
    name: '本人银行卡',
    required: true,
    uploaded: true
  }, {
    name: '近期免冠照片',
    required: true,
    uploaded: true
  }],
  logs: [{
    status: 'SUBMITTED',
    label: '已提交',
    time: '2026-11-05 09:10',
    operator: '王秀兰',
    note: '提交高龄津贴申请'
  }, {
    status: 'ACCEPTED',
    label: '已受理',
    time: '2026-11-05 15:30',
    operator: '李建国',
    note: '材料齐全，已受理'
  }, {
    status: 'APPROVED',
    label: '已核准',
    time: '2026-11-10 11:00',
    operator: '口前镇民政办',
    note: '符合 80 周岁高龄津贴条件'
  }, {
    status: 'COMPLETED',
    label: '已办结',
    time: '2026-11-12 16:20',
    operator: '新源村党群服务中心',
    note: '津贴自 11 月起按月发放'
  }]
}, {
  id: 'ap_seed_3',
  applyNo: 'SB202611100003',
  itemCode: 'DZ004',
  itemName: '独生子女父母光荣证核发',
  itemShortName: '独生子女证',
  status: 'SUPPLEMENT',
  amount: 0,
  createdAt: '2026-11-10 15:40',
  promiseAt: '2026-11-17 19:30',
  rating: 0,
  missingMaterials: ['子女出生医学证明'],
  formData: {
    申请人姓名: '王秀兰',
    身份证号: '220221********002X',
    结婚登记日期: '2008-06-12',
    子女姓名: '李晓梅',
    子女出生日期: '2010-03-08'
  },
  materials: [{
    name: '夫妻双方身份证',
    required: true,
    uploaded: true
  }, {
    name: '户口簿',
    required: true,
    uploaded: true
  }, {
    name: '结婚证',
    required: true,
    uploaded: true
  }, {
    name: '子女出生医学证明',
    required: true,
    uploaded: false
  }, {
    name: '免冠照片',
    required: true,
    uploaded: false
  }],
  logs: [{
    status: 'SUBMITTED',
    label: '已提交',
    time: '2026-11-10 15:40',
    operator: '王秀兰',
    note: '提交独生子女证申请'
  }, {
    status: 'ACCEPTED',
    label: '已受理',
    time: '2026-11-11 09:20',
    operator: '李建国',
    note: '材料初审通过'
  }, {
    status: 'SUPPLEMENT',
    label: '待补正',
    time: '2026-11-11 16:10',
    operator: '新源村党群服务中心',
    note: '缺子女出生医学证明，请补齐后重新提交'
  }]
}]

const seedRequests = [{
  id: 'rq_seed_1',
  requestNo: 'QZ202611090001',
  type: 'appeal',
  typeLabel: '诉求建议',
  title: '三组东侧路灯不亮，晚上出行不安全',
  content: '三组 26 号东侧的两盏路灯坏了快一周，晚上老人散步看不清路，希望尽快维修。',
  location: '三组 26 号东侧',
  contactPhone: '138****6621',
  status: 'PROCESSING',
  createdAt: '2026-11-09 20:10',
  rating: 0,
  photos: [],
  logs: [{
    status: 'PENDING',
    label: '待受理',
    time: '2026-11-09 20:10',
    operator: '王秀兰',
    note: '提交诉求'
  }, {
    status: 'ACCEPTED',
    label: '已受理',
    time: '2026-11-10 08:40',
    operator: '李建国',
    note: '已到现场核实，联系维修队'
  }, {
    status: 'PROCESSING',
    label: '办理中',
    time: '2026-11-10 14:00',
    operator: '村水电维修组',
    note: '已采购灯头，预计 11 月 15 日前更换'
  }],
  replies: [{
    time: '2026-11-10 14:05',
    operator: '李建国',
    content: '您好，路灯配件已到货，这两天会安排更换，请再耐心等一下。'
  }]
}, {
  id: 'rq_seed_2',
  requestNo: 'QZ202611020002',
  type: 'consult',
  typeLabel: '咨询帮办',
  title: '医保异地就医备案怎么办理？',
  content: '我女儿在长春住院，想用新源的医保报销，需要提前备案吗？要哪些材料？',
  location: '',
  contactPhone: '138****6621',
  status: 'COMPLETED',
  createdAt: '2026-11-02 09:30',
  rating: 0,
  photos: [],
  logs: [{
    status: 'PENDING',
    label: '待受理',
    time: '2026-11-02 09:30',
    operator: '王秀兰',
    note: '提交咨询'
  }, {
    status: 'ACCEPTED',
    label: '已受理',
    time: '2026-11-02 10:10',
    operator: '刘芳',
    note: '医保专干接手'
  }, {
    status: 'COMPLETED',
    label: '已办结',
    time: '2026-11-02 11:20',
    operator: '刘芳',
    note: '已电话回复并发送备案操作步骤'
  }],
  replies: [{
    time: '2026-11-02 11:20',
    operator: '刘芳',
    content: '已电话告知：在“吉林医保”小程序做异地就医备案，选长春，上传身份证和住院证明即可。'
  }]
}]

const serviceDirectory = [{
  id: 'd1',
  category: '供水',
  name: '永吉县自来水公司',
  desc: '报修、缴费、停水通知',
  phone: '043264212345',
  phoneDisplay: '0432-64212345',
  hours: '24 小时抢修',
  icon: '水',
  color: '#2F7FB8',
  tint: '#EAF4FB'
}, {
  id: 'd2',
  category: '供电',
  name: '国网永吉县供电公司',
  desc: '故障报修、电费查询',
  phone: '043264223333',
  phoneDisplay: '0432-64223333',
  hours: '24 小时抢修 · 95598',
  icon: '电',
  color: '#C99437',
  tint: '#FBF4E2'
}, {
  id: 'd3',
  category: '燃气',
  name: '永吉县燃气公司',
  desc: '燃气报修、开户、安检',
  phone: '043264234567',
  phoneDisplay: '0432-64234567',
  hours: '10:00—19:30',
  icon: '气',
  color: '#D06A2D',
  tint: '#FDF0E8'
}, {
  id: 'd4',
  category: '供暖',
  name: '口前镇供热站',
  desc: '暖气不热、管道漏水',
  phone: '043264245678',
  phoneDisplay: '0432-64245678',
  hours: '供暖季 24 小时',
  icon: '暖',
  color: '#B3202A',
  tint: '#FBEBEB'
}, {
  id: 'd5',
  category: '维修',
  name: '村水电维修组',
  desc: '跳闸、水管、门锁小修',
  phone: '13843219072',
  phoneDisplay: '138****9072',
  hours: '08:00—22:00',
  icon: '修',
  color: '#2F8A59',
  tint: '#EAF4EE'
}, {
  id: 'd6',
  category: '医疗',
  name: '新源村卫生室',
  desc: '常见病、慢病配药、测量血压',
  phone: '043264278901',
  phoneDisplay: '0432-64278901',
  hours: '10:00—19:30',
  icon: '医',
  color: '#2F7FB8',
  tint: '#EAF4FB'
}, {
  id: 'd7',
  category: '医疗',
  name: '永吉县人民医院',
  desc: '急诊、住院、出生证明',
  phone: '120',
  phoneDisplay: '120',
  hours: '24 小时急诊',
  icon: '院',
  color: '#C4161C',
  tint: '#FBEBEB'
}, {
  id: 'd8',
  category: '村务',
  name: '新源村党群服务中心',
  desc: '办事咨询、诉求登记、代办',
  phone: '043264216888',
  phoneDisplay: '0432-64216888',
  hours: '周一至周五 10:00—19:30',
  icon: '村',
  color: '#C4161C',
  tint: '#FBEBEB'
}]

const jobs = [{
  id: 'j1',
  title: '村内保洁员',
  company: '新源村村民委员会',
  salary: '1800—2200 元/月',
  count: 2,
  location: '新源村三组、四组',
  tags: ['长期', '缴纳意外险', '就近'],
  desc: '负责村组道路日常保洁、垃圾清运配合，每天 4 小时左右，适合本村常住村民。',
  contact: '043264216888',
  contactDisplay: '0432-64216888',
  publishedAt: '2026-11-10',
  deadline: '2026-11-30'
}, {
  id: 'j2',
  title: '苹果分拣、包装临时工',
  company: '新源果业合作社',
  salary: '150 元/天，日结',
  count: 10,
  location: '新源村冷库',
  tags: ['临时', '日结', '包午餐'],
  desc: '苹果分拣、装箱，11 月 18 日—12 月 10 日，每天 8 小时，男女不限。',
  contact: '13843219072',
  contactDisplay: '138****9072',
  publishedAt: '2026-11-12',
  deadline: '2026-11-25'
}, {
  id: 'j3',
  title: '电商客服（可居家）',
  company: '永吉县电商公共服务中心',
  salary: '3000—4500 元/月',
  count: 1,
  location: '县城 / 居家',
  tags: ['长期', '会手机操作', '培训'],
  desc: '负责农产品网店客服、订单处理，提供岗前培训，会使用手机和电脑即可。',
  contact: '043264288666',
  contactDisplay: '0432-64288666',
  publishedAt: '2026-11-08',
  deadline: '2026-12-15'
}, {
  id: 'j4',
  title: '小区保安',
  company: '永吉县城投物业',
  salary: '2600 元/月',
  count: 2,
  location: '县城幸福小区',
  tags: ['长期', '包住', '轮班'],
  desc: '门岗值守、巡逻，要求 55 岁以下、身体健康，退伍军人优先。',
  contact: '043264299000',
  contactDisplay: '0432-64299000',
  publishedAt: '2026-11-05',
  deadline: '2026-12-01'
}]

const teaMeetings = [{
  id: 't1',
  title: '冬季取暖安全怎么管？',
  date: '2026-11-20 20:00',
  location: '村党群服务中心二楼',
  status: '报名中',
  joined: 18,
  total: 40,
  host: '村两委 · 新时代文明实践站',
  summary: '一起议一议煤炉取暖、一氧化碳报警器、独居老人上门检查的安排。',
  agenda: ['通报今年取暖安全形势', '村民提问题、提办法', '确定网格员包户名单']
}, {
  id: 't2',
  title: '医保缴费“最后一公里”',
  date: '2026-12-05 20:00',
  location: '村党群服务中心二楼',
  status: '报名中',
  joined: 26,
  total: 40,
  host: '村医保专干 刘芳',
  summary: '不会用手机缴费的老人怎么办？集中代缴怎么安排？现场演示手机缴费。',
  agenda: ['演示手机缴费流程', '统计需要上门代缴的老人', '确定集中代缴时间']
}, {
  id: 't3',
  title: '苹果销售与电商',
  date: '2026-11-08 20:00',
  location: '村党群服务中心二楼',
  status: '已结束',
  joined: 32,
  total: 40,
  host: '村新时代文明实践站',
  summary: '复盘助农直播经验，商量明年苹果怎么卖得更远。',
  agenda: ['直播复盘', '包装与物流问题', '明年电商培训计划']
}]

const dicts = {
  applyStatus: [{
    value: 'DRAFT',
    label: '草稿'
  }, {
    value: 'SUBMITTED',
    label: '已提交'
  }, {
    value: 'ACCEPTED',
    label: '已受理'
  }, {
    value: 'SUPPLEMENT',
    label: '待补正'
  }, {
    value: 'APPROVED',
    label: '已核准'
  }, {
    value: 'PAID',
    label: '已缴费'
  }, {
    value: 'COMPLETED',
    label: '已办结'
  }, {
    value: 'REJECTED',
    label: '已驳回'
  }, {
    value: 'CANCELED',
    label: '已撤销'
  }],
  materialStatus: [{
    value: 'PENDING',
    label: '待上传'
  }, {
    value: 'UPLOADED',
    label: '已上传'
  }, {
    value: 'REJECTED',
    label: '需重新上传'
  }],
  requestStatus: [{
    value: 'PENDING',
    label: '待受理'
  }, {
    value: 'ACCEPTED',
    label: '已受理'
  }, {
    value: 'PROCESSING',
    label: '办理中'
  }, {
    value: 'COMPLETED',
    label: '已办结'
  }, {
    value: 'CLOSED',
    label: '已关闭'
  }, {
    value: 'RATED',
    label: '已评价'
  }]
}

module.exports = {
  village: village,
  regionTree: regionTree,
  user: user,
  columns: columns,
  articles: articles,
  banner: banner,
  notice: notice,
  modules: modules,
  govCategories: govCategories,
  govItems: govItems,
  suggestions: suggestions,
  footer: footer,
  appConfig: appConfig,
  dicts: dicts,
  applyStatusLabels: applyStatusLabels,
  requestStatusLabels: requestStatusLabels,
  seedApplies: seedApplies,
  seedRequests: seedRequests,
  serviceDirectory: serviceDirectory,
  jobs: jobs,
  teaMeetings: teaMeetings
}
