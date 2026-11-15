
const fs = require("fs");
const path = require("path");
const data = require(path.join(__dirname, "..", "cilent", "mock", "data.js"));

const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
};
const j = (v) => (v === null || v === undefined ? "NULL" : q(JSON.stringify(v)));
const n = (v) => (v === null || v === undefined || v === "" ? "0" : String(Number(v) || 0));

const out = [];
const head = (t) => out.push("\n-- " + t);
const ins = (table, cols, rows) => {
  if (!rows.length) return;
  out.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES");
  out.push(rows.map((r) => "(" + r.join(", ") + ")").join(",\n") + ";");
};

// 区域树
head("区域树");
const regionRows = [];
(function walk(nodes, parent) {
  (nodes || []).forEach((r, i) => {
    regionRows.push([q(r.id), q(parent), q(r.name), n(r.level), q(r.grid), q(r.status || "online"), n(i + 1)]);
    if (r.children) walk(r.children, r.id);
  });
})(data.regionTree, "");
ins("sys_region", ["id", "parent_id", "name", "level", "grid", "status", "sort"], regionRows);

// 村情
head("村情");
ins("sys_village",
  ["id", "name", "full_name", "grid_name", "region_path", "grid_worker", "households", "population", "party_members"],
  [[q(data.village.id), q(data.village.name), q(data.village.fullName), q(data.village.gridName),
    j(data.village.regionPath), j(data.village.gridWorker), n(data.village.households),
    n(data.village.population), n(data.village.partyMembers)]]);

// 用户
head("用户");
const u = data.user;
// 演示账号密码 123456 的 BCrypt 哈希（与前端登录页提示一致）
const DEMO_PASSWORD_HASH = "$2a$10$j7flrxK2h9WHXWbFw3t6/.eoyJDx7cNaWsBHAMIU5S8r7gByh5n8e";
ins("sys_user",
  ["id", "openid", "name", "nickname", "role_code", "role_name", "phone", "phone_display", "avatar_text",
   "avatar_url", "region_id", "grid_name", "house_no", "joined_at", "is_verified", "status", "password_hash"],
  [
    [q(u.id), q("seed_openid_" + u.id), q(u.name), q(u.nickname), q(u.roleCode), q(u.roleName),
     q(u.phone), q(u.phoneDisplay), q(u.avatarText), q(""), q(u.regionId), q(u.gridName),
     q(u.houseNo), q(u.joinedAt), "1", "1", q(DEMO_PASSWORD_HASH)],
    // V3 管理员账号
    [q("u1002"), "NULL", q("李建国"), q("李建国"), q("admin"), q("管理员"), q("13843219072"), q("138****9072"), q("李"),
     q(""), q(u.regionId), q("第三网格"), q("村部 1 号"), q("2023-01-10"), "1", "1", q(DEMO_PASSWORD_HASH)]
  ]);

// 配置
head("应用配置");
const cfg = [
  ["appName", data.appConfig.appName, "APP"],
  ["slogan", data.appConfig.slogan, "APP"],
  ["hotline", data.appConfig.hotline, "APP"],
  ["aiDisclaimer", data.appConfig.aiDisclaimer, "AI"],
  ["aiWelcome", data.appConfig.aiWelcome, "AI"],
  ["footer", JSON.stringify(data.footer), "APP"],
  ["features", JSON.stringify(data.appConfig.features), "APP"],
  ["fileBaseUrl", "http://127.0.0.1:8080/static/upload", "APP"]
];
ins("sys_config", ["config_key", "config_value", "config_group"],
  cfg.map(([k, v, g]) => [q(k), q(v), q(g)]));

// 字典
head("字典");
const dictRows = [];
Object.keys(data.dicts).forEach((type) => {
  data.dicts[type].forEach((d, i) => dictRows.push([q(type), q(d.value), q(d.label), n(i + 1)]));
});
ins("sys_dict", ["dict_type", "dict_value", "dict_label", "sort"], dictRows);

// 栏目
head("栏目");
ins("cms_column", ["id", "code", "name", "short_name", "color", "description", "sort", "status"],
  data.columns.map((c) => [q(c.id), q(c.code), q(c.name), q(c.shortName), q(c.color), q(c.description), n(c.sort), "1"]));

// 资讯
head("资讯");
ins("cms_article",
  ["id", "column_id", "title", "summary", "content", "is_top", "published_at", "views", "likes", "source", "author", "status"],
  data.articles.map((a) => [q(a.id), q(a.columnId), q(a.title), q(a.summary), q(a.content),
    a.isTop ? "1" : "0", q(a.publishedAt), n(a.views), n(a.likes), q(a.source), q(a.author), q("PUBLISHED")]));

// 入口
head("九宫格");
ins("app_module", ["id", "code", "name", "desc_text", "icon", "tint", "route", "status", "badge", "version", "highlight", "sort"],
  data.modules.map((m, i) => [q(m.id), q(m.code), q(m.name), q(m.desc), q(m.icon), q(m.tint), q(m.route),
    q(m.status), q(m.badge || ""), q(m.version), m.highlight ? "1" : "0", n(i + 1)]));

// banner / notice
head("Banner 与通知");
ins("cms_banner", ["id", "tag", "title", "title_highlight", "subtitle", "meta", "action_text", "article_id", "theme", "status"],
  [[q(data.banner.id), q(data.banner.tag), q(data.banner.title), q(data.banner.titleHighlight),
    q(data.banner.subtitle), q(data.banner.meta), q(data.banner.actionText), q(data.banner.articleId),
    q(data.banner.theme), "1"]]);
ins("cms_notice", ["id", "text", "type", "article_id", "status"],
  [[q(data.notice.id), q(data.notice.text), q(data.notice.type), q(data.notice.articleId), "1"]]);

// 政务分类
head("政务分类");
ins("gov_category", ["id", "code", "name", "desc_text", "sort"],
  data.govCategories.map((c, i) => [q(c.id), q(c.code), q(c.name), q(c.desc), n(i + 1)]));

// 政务事项
head("政务事项");
ins("gov_item",
  ["id", "code", "category_id", "category_name", "name", "short_name", "summary", "icon", "icon_tint", "tags",
   "target", "promise_days", "fee", "phone", "address", "update_at", "conditions_json", "materials", "steps",
   "form_fields", "basis", "faqs", "status", "sort"],
  data.govItems.map((g, i) => [q(g.id), q(g.code), q(g.categoryId), q(g.categoryName), q(g.name), q(g.shortName),
    q(g.summary), q(g.icon), q(g.iconTint), j(g.tags), q(g.target), n(g.promiseDays), q(g.fee), q(g.phone),
    q(g.address), q(g.updateAt), j(g.conditions), j(g.materials), j(g.steps), j(g.formFields),
    j(g.basis), j(g.faqs), "1", n(i + 1)]));

// AI 推荐问
head("AI 推荐问");
ins("ai_suggestion", ["id", "text", "icon", "sort"],
  data.suggestions.map((s, i) => [q(s.id), q(s.text), q(s.icon), n(i + 1)]));

// 便民服务
head("服务黄页 / 招聘 / 奶茶会");
ins("biz_directory", ["id", "category", "name", "desc_text", "phone", "phone_display", "hours", "icon", "color", "tint", "sort"],
  data.serviceDirectory.map((d, i) => [q(d.id), q(d.category), q(d.name), q(d.desc), q(d.phone),
    q(d.phoneDisplay), q(d.hours), q(d.icon), q(d.color), q(d.tint), n(i + 1)]));
ins("biz_job", ["id", "title", "company", "salary", "count_num", "location", "tags", "desc_text",
  "contact", "contact_display", "published_at", "deadline", "status", "sort"],
  data.jobs.map((x, i) => [q(x.id), q(x.title), q(x.company), q(x.salary), n(x.count), q(x.location),
    j(x.tags), q(x.desc), q(x.contact), q(x.contactDisplay), q(x.publishedAt), q(x.deadline), "1", n(i + 1)]));
ins("biz_tea_meeting", ["id", "title", "meet_date", "location", "status", "joined", "total", "host", "summary", "agenda", "sort"],
  data.teaMeetings.map((t, i) => [q(t.id), q(t.title), q(t.date), q(t.location), q(t.status),
    n(t.joined), n(t.total), q(t.host), q(t.summary), j(t.agenda), n(i + 1)]));

// 种子办件
head("种子办件");
const applyRows = [];
const applyLogRows = [];
(data.seedApplies || []).forEach((a) => {
  const r = a.rating && a.rating.score ? a.rating : null;
  applyRows.push([q(a.id), q(a.applyNo), q(u.id), q(a.itemCode), q(a.itemName), q(a.itemShortName), q(a.status),
    n(a.amount), j(a.formData), j(a.materials), j(a.missingMaterials || []), q(a.agentUserId), q(a.agentName || ""),
    n(r ? r.score : 0), q(r ? r.comment : null), q(r ? r.time : null), q(a.createdAt), q(a.promiseAt)]);
  (a.logs || []).forEach((l, idx) => {
    applyLogRows.push([q(a.id), q(l.status), q(l.label), q(l.time), q(l.operator), q(l.note), String(idx + 1)]);
  });
});
ins("gov_apply", ["id", "apply_no", "user_id", "item_code", "item_name", "item_short_name", "status", "amount",
  "form_data", "materials", "missing_materials", "agent_user_id", "agent_name", "rating_score", "rating_comment",
  "rating_time", "created_at", "promise_at"], applyRows);
ins("gov_apply_log", ["apply_id", "status", "label", "time_text", "operator", "note", "sort"], applyLogRows);

// 种子诉求
head("种子诉求");
const reqRows = [];
const reqLogRows = [];
const reqReplyRows = [];
(data.seedRequests || []).forEach((r0) => {
  const r = r0.rating && r0.rating.score ? r0.rating : null;
  reqRows.push([q(r0.id), q(r0.requestNo), q(u.id), q(r0.type), q(r0.typeLabel), q(r0.title), q(r0.content),
    q(r0.location), q(r0.contactPhone), j(r0.photos || []), q(r0.status), n(r0.urgeCount),
    n(r ? r.score : 0), q(r ? r.comment : null), q(r ? r.time : null), q(r0.createdAt)]);
  (r0.logs || []).forEach((l, idx) => {
    reqLogRows.push([q(r0.id), q(l.status), q(l.label), q(l.time), q(l.operator), q(l.note), String(idx + 1)]);
  });
  (r0.replies || []).forEach((rp, idx) => {
    reqReplyRows.push([q(r0.id), q(rp.time), q(rp.operator), q(rp.content), String(idx + 1)]);
  });
});
ins("biz_request", ["id", "request_no", "user_id", "type", "type_label", "title", "content", "location",
  "contact_phone", "photos", "status", "urge_count", "rating_score", "rating_comment", "rating_time", "created_at"], reqRows);
ins("biz_request_log", ["request_id", "status", "label", "time_text", "operator", "note", "sort"], reqLogRows);
ins("biz_request_reply", ["request_id", "time_text", "operator", "content", "sort"], reqReplyRows);

// 户籍样例（V3 统计用，确定性生成：3 网格 / 20 户 / 66 人）
head("户籍样例");
const GRIDS = ["第一网格", "第二网格", "第三网格"];
const SURNAMES = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴"];
const GIVEN = ["建国", "秀兰", "志强", "丽华", "国庆", "桂英", "永强", "秀英", "国梁", "玉梅"];
const hhRows = [];
const hmRows = [];
for (let i = 0; i < 20; i++) {
  const grid = GRIDS[i % 3];
  const size = 2 + (i % 4);           // 2..5 人
  const hhId = "hh" + String(i + 1).padStart(3, "0");
  const hhNo = "H" + u.regionId + String(i + 1).padStart(3, "0");
  const head = SURNAMES[i % 10] + GIVEN[i % 10];
  hhRows.push([q(hhId), q(hhNo), q(u.regionId), q(grid), q(head),
    q("138" + String(20000000 + i).padStart(8, "0")), q(grid + " " + (i + 1) + " 号"), String(size),
    q(i % 5 === 4 ? "空挂" : "常住")]);
  const headAge = 30 + ((i * 7) % 30);
  for (let m = 0; m < size; m++) {
    let name, gender, age, relation, isHead = m === 0 ? "1" : "0";
    if (m === 0) { name = head; gender = "男"; age = headAge; relation = "户主"; }
    else if (m === 1) { name = SURNAMES[(i + 3) % 10] + "秀英"; gender = "女"; age = headAge - (i % 4); relation = "配偶"; }
    else if (m === 2) { name = SURNAMES[i % 10] + (i % 2 ? "小" : "志"); gender = i % 2 ? "女" : "男"; age = 3 + ((i * 5) % 18); relation = "子女"; }
    else if (m === 3) { name = SURNAMES[(i + 5) % 10] + "老"; gender = "男"; age = 60 + ((i * 7) % 25); relation = "父母"; }
    else { name = SURNAMES[i % 10] + "芳"; gender = "女"; age = 5 + ((i * 3) % 16); relation = "子女"; }
    hmRows.push([q("hm" + (i * 5 + m + 1)), q(hhId), q(name), q(gender), String(age),
      q(relation), q("220221********" + String(1000 + i * 10 + m)), isHead]);
  }
}
ins("sys_household", ["id", "household_no", "region_id", "grid_name", "head_name", "head_phone",
  "address", "member_count", "category"], hhRows);
ins("sys_household_member", ["id", "household_id", "name", "gender", "age", "relation", "id_card_masked", "is_head"], hmRows);

const sql = "-- 自动生成：node db/gen-seed.cjs（数据源 cilent/mock/data.js）\n" +
  "SET NAMES utf8mb4;\nUSE xinyuan_village;\nSET FOREIGN_KEY_CHECKS = 0;\n" +
  "TRUNCATE TABLE sys_region;\nTRUNCATE TABLE sys_village;\nTRUNCATE TABLE sys_user;\nTRUNCATE TABLE sys_config;\n" +
  "TRUNCATE TABLE sys_dict;\nTRUNCATE TABLE cms_column;\nTRUNCATE TABLE cms_article;\nTRUNCATE TABLE cms_article_like;\n" +
  "TRUNCATE TABLE app_module;\nTRUNCATE TABLE cms_banner;\nTRUNCATE TABLE cms_notice;\nTRUNCATE TABLE gov_category;\n" +
  "TRUNCATE TABLE gov_item;\nTRUNCATE TABLE gov_apply;\nTRUNCATE TABLE gov_apply_log;\nTRUNCATE TABLE biz_request;\n" +
  "TRUNCATE TABLE biz_request_log;\nTRUNCATE TABLE biz_request_reply;\nTRUNCATE TABLE biz_directory;\nTRUNCATE TABLE biz_job;\n" +
  "TRUNCATE TABLE biz_tea_meeting;\nTRUNCATE TABLE ai_suggestion;\nTRUNCATE TABLE ai_conversation;\nTRUNCATE TABLE ai_message;\nTRUNCATE TABLE sys_household;\nTRUNCATE TABLE sys_household_member;\nTRUNCATE TABLE user_family_member;\n" +
  out.join("\n") + "\nSET FOREIGN_KEY_CHECKS = 1;\n";

fs.writeFileSync(path.join(__dirname, "seed.sql"), sql, "utf8");
console.log("seed.sql written:", sql.length, "bytes");
console.log("rows:", {
  regions: regionRows.length, articles: data.articles.length, govItems: data.govItems.length,
  modules: data.modules.length, directory: data.serviceDirectory.length, jobs: data.jobs.length,
  tea: data.teaMeetings.length, applies: applyRows.length, requests: reqRows.length,
  households: hhRows.length, householdMembers: hmRows.length
});
