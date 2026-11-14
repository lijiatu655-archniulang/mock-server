-- =====================================================================
-- 新源村情通 · 后端数据库（严格对齐 cilent/mock/data.js 与接口契约 v1）
-- MySQL 8.0+ / utf8mb4 / InnoDB
-- 约定：主键为字符串（前端要求），时间 yyyy-MM-dd HH:mm:ss，金额单位分
-- =====================================================================
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS xinyuan_village DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE xinyuan_village;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sys_region;
CREATE TABLE sys_region (
  id           VARCHAR(32)  NOT NULL,
  parent_id    VARCHAR(32)  NOT NULL DEFAULT '',
  name         VARCHAR(64)  NOT NULL,
  level        TINYINT      NOT NULL DEFAULT 1,
  grid         VARCHAR(32)  DEFAULT NULL,
  status       VARCHAR(16)  NOT NULL DEFAULT 'online',
  sort         INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_parent (parent_id)
) ENGINE=InnoDB COMMENT='县/镇/村区域树';

DROP TABLE IF EXISTS sys_village;
CREATE TABLE sys_village (
  id               VARCHAR(32)  NOT NULL,
  name             VARCHAR(64)  NOT NULL,
  full_name        VARCHAR(255) NOT NULL,
  grid_name        VARCHAR(64)  DEFAULT NULL,
  region_path      JSON         DEFAULT NULL COMMENT '["新源县","城关镇","新源村"]',
  grid_worker      JSON         DEFAULT NULL COMMENT '{name,phone,phoneDisplay,duty}',
  households       INT          NOT NULL DEFAULT 0,
  population       INT          NOT NULL DEFAULT 0,
  party_members    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='村情概况';

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
  id             VARCHAR(32)  NOT NULL,
  openid         VARCHAR(64)  DEFAULT NULL,
  name           VARCHAR(32)  NOT NULL,
  nickname       VARCHAR(32)  NOT NULL,
  role_code      VARCHAR(16)  NOT NULL DEFAULT 'villager' COMMENT 'villager / grid_worker',
  role_name      VARCHAR(16)  NOT NULL DEFAULT '村民',
  phone          VARCHAR(20)  DEFAULT NULL,
  phone_display  VARCHAR(20)  DEFAULT NULL,
  avatar_text    VARCHAR(4)   DEFAULT NULL,
  avatar_url     VARCHAR(512) NOT NULL DEFAULT '',
  region_id      VARCHAR(32)  NOT NULL,
  grid_name      VARCHAR(32)  DEFAULT NULL,
  house_no       VARCHAR(64)  DEFAULT NULL,
  joined_at      DATE         DEFAULT NULL,
  is_verified    TINYINT      NOT NULL DEFAULT 0,
  password_hash  VARCHAR(100) DEFAULT NULL COMMENT '账号密码登录（BCrypt）',
  status         TINYINT      NOT NULL DEFAULT 1,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_openid (openid),
  KEY idx_region (region_id)
) ENGINE=InnoDB COMMENT='用户';

DROP TABLE IF EXISTS sys_config;
CREATE TABLE sys_config (
  config_key   VARCHAR(64)   NOT NULL,
  config_value TEXT          NOT NULL,
  config_group VARCHAR(32)   NOT NULL DEFAULT 'APP',
  remark       VARCHAR(255)  DEFAULT NULL,
  PRIMARY KEY (config_key)
) ENGINE=InnoDB COMMENT='应用配置（footer/features/欢迎语等）';

DROP TABLE IF EXISTS sys_dict;
CREATE TABLE sys_dict (
  dict_type  VARCHAR(32) NOT NULL,
  dict_value VARCHAR(32) NOT NULL,
  dict_label VARCHAR(32) NOT NULL,
  sort       INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (dict_type, dict_value)
) ENGINE=InnoDB COMMENT='字典：applyStatus/materialStatus/requestStatus';

DROP TABLE IF EXISTS cms_column;
CREATE TABLE cms_column (
  id          VARCHAR(16)  NOT NULL,
  code        VARCHAR(32)  NOT NULL,
  name        VARCHAR(32)  NOT NULL,
  short_name  VARCHAR(16)  DEFAULT NULL,
  color       VARCHAR(16)  DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  sort        INT          NOT NULL DEFAULT 0,
  status      TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB COMMENT='资讯栏目';

DROP TABLE IF EXISTS cms_article;
CREATE TABLE cms_article (
  id           VARCHAR(32)  NOT NULL,
  column_id    VARCHAR(16)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  summary      VARCHAR(500) DEFAULT NULL,
  content      LONGTEXT,
  is_top       TINYINT      NOT NULL DEFAULT 0,
  published_at DATETIME     NOT NULL,
  views        INT          NOT NULL DEFAULT 0,
  likes        INT          NOT NULL DEFAULT 0,
  source       VARCHAR(64)  DEFAULT NULL,
  author       VARCHAR(64)  DEFAULT NULL,
  status       VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_col_pub (column_id, status, published_at),
  KEY idx_top (is_top, published_at)
) ENGINE=InnoDB COMMENT='资讯';

DROP TABLE IF EXISTS cms_article_like;
CREATE TABLE cms_article_like (
  article_id VARCHAR(32) NOT NULL,
  user_id    VARCHAR(32) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, user_id)
) ENGINE=InnoDB COMMENT='点赞（幂等）';

DROP TABLE IF EXISTS app_module;
CREATE TABLE app_module (
  id        VARCHAR(16)  NOT NULL,
  code      VARCHAR(32)  NOT NULL,
  name      VARCHAR(32)  NOT NULL,
  desc_text VARCHAR(64)  DEFAULT NULL,
  icon      VARCHAR(255) DEFAULT NULL,
  tint      VARCHAR(16)  DEFAULT NULL,
  route     VARCHAR(255) NOT NULL DEFAULT '',
  status    VARCHAR(16)  NOT NULL DEFAULT 'online' COMMENT 'online / coming',
  badge     VARCHAR(16)  DEFAULT NULL,
  version   VARCHAR(8)   NOT NULL DEFAULT 'V1',
  highlight TINYINT      NOT NULL DEFAULT 0,
  sort      INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB COMMENT='九宫格入口';

DROP TABLE IF EXISTS cms_banner;
CREATE TABLE cms_banner (
  id              VARCHAR(16)  NOT NULL,
  tag             VARCHAR(32)  DEFAULT NULL,
  title           VARCHAR(64)  NOT NULL,
  title_highlight VARCHAR(64)  DEFAULT NULL,
  subtitle        VARCHAR(128) DEFAULT NULL,
  meta            VARCHAR(128) DEFAULT NULL,
  action_text     VARCHAR(32)  DEFAULT NULL,
  article_id      VARCHAR(32)  DEFAULT NULL,
  theme           VARCHAR(16)  NOT NULL DEFAULT 'red',
  status          TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='首页横幅';

DROP TABLE IF EXISTS cms_notice;
CREATE TABLE cms_notice (
  id         VARCHAR(16)  NOT NULL,
  text       VARCHAR(255) NOT NULL,
  type       VARCHAR(16)  NOT NULL DEFAULT 'normal' COMMENT 'urgent / normal',
  article_id VARCHAR(32)  DEFAULT NULL,
  status     TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='首页通知条';

DROP TABLE IF EXISTS gov_category;
CREATE TABLE gov_category (
  id     VARCHAR(16)  NOT NULL,
  code   VARCHAR(16)  NOT NULL,
  name   VARCHAR(32)  NOT NULL,
  desc_text VARCHAR(64) DEFAULT NULL,
  sort   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB COMMENT='政务分类';

DROP TABLE IF EXISTS gov_item;
CREATE TABLE gov_item (
  id             VARCHAR(16)  NOT NULL,
  code           VARCHAR(32)  NOT NULL,
  category_id    VARCHAR(16)  NOT NULL,
  category_name  VARCHAR(32)  NOT NULL,
  name           VARCHAR(128) NOT NULL,
  short_name     VARCHAR(32)  NOT NULL,
  summary        VARCHAR(500) DEFAULT NULL,
  icon           VARCHAR(4)   DEFAULT NULL,
  icon_tint      VARCHAR(16)  DEFAULT NULL,
  tags           JSON         DEFAULT NULL,
  target         VARCHAR(255) DEFAULT NULL,
  promise_days   INT          NOT NULL DEFAULT 1,
  fee            VARCHAR(255) DEFAULT NULL,
  phone          VARCHAR(20)  DEFAULT NULL,
  address        VARCHAR(255) DEFAULT NULL,
  update_at      VARCHAR(16)  DEFAULT NULL,
  conditions_json JSON        DEFAULT NULL,
  materials      JSON         DEFAULT NULL,
  steps          JSON         DEFAULT NULL,
  form_fields    JSON         DEFAULT NULL,
  basis          JSON         DEFAULT NULL,
  faqs           JSON         DEFAULT NULL,
  status         TINYINT      NOT NULL DEFAULT 1,
  sort           INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code),
  KEY idx_cat (category_id)
) ENGINE=InnoDB COMMENT='政务事项（含动态表单定义）';

DROP TABLE IF EXISTS gov_apply;
CREATE TABLE gov_apply (
  id                  VARCHAR(32)  NOT NULL,
  apply_no            VARCHAR(32)  NOT NULL,
  user_id             VARCHAR(32)  NOT NULL,
  item_code           VARCHAR(32)  NOT NULL,
  item_name           VARCHAR(128) NOT NULL,
  item_short_name     VARCHAR(32)  DEFAULT NULL,
  status              VARCHAR(16)  NOT NULL DEFAULT 'SUBMITTED',
  amount              INT          NOT NULL DEFAULT 0 COMMENT '金额（分）',
  form_data           JSON         DEFAULT NULL,
  materials           JSON         DEFAULT NULL,
  missing_materials   JSON         DEFAULT NULL,
  agent_user_id       VARCHAR(32)  DEFAULT NULL,
  agent_name          VARCHAR(32)  DEFAULT NULL,
  rating_score        TINYINT      NOT NULL DEFAULT 0,
  rating_comment      VARCHAR(255) DEFAULT NULL,
  rating_time         DATETIME     DEFAULT NULL,
  cancel_reason       VARCHAR(255) DEFAULT NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  promise_at          DATETIME     DEFAULT NULL,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_apply_no (apply_no),
  KEY idx_user (user_id, created_at)
) ENGINE=InnoDB COMMENT='政务办件';

DROP TABLE IF EXISTS gov_apply_log;
CREATE TABLE gov_apply_log (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  apply_id   VARCHAR(32) NOT NULL,
  status     VARCHAR(16) NOT NULL,
  label      VARCHAR(32) NOT NULL,
  time_text  VARCHAR(32) NOT NULL,
  operator   VARCHAR(32) DEFAULT NULL,
  note       VARCHAR(255) DEFAULT NULL,
  sort       INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_apply (apply_id, sort)
) ENGINE=InnoDB COMMENT='办件时间轴';

DROP TABLE IF EXISTS biz_request;
CREATE TABLE biz_request (
  id             VARCHAR(32)  NOT NULL,
  request_no     VARCHAR(32)  NOT NULL,
  user_id        VARCHAR(32)  NOT NULL,
  type           VARCHAR(16)  NOT NULL COMMENT 'consult/appeal/suggestion',
  type_label     VARCHAR(16)  NOT NULL,
  title          VARCHAR(128) NOT NULL,
  content        TEXT         NOT NULL,
  location       VARCHAR(255) DEFAULT NULL,
  contact_phone  VARCHAR(20)  DEFAULT NULL,
  photos         JSON         DEFAULT NULL,
  status         VARCHAR(16)  NOT NULL DEFAULT 'PENDING',
  urge_count     INT          NOT NULL DEFAULT 0,
  rating_score   TINYINT      NOT NULL DEFAULT 0,
  rating_comment VARCHAR(255) DEFAULT NULL,
  rating_time    DATETIME     DEFAULT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_request_no (request_no),
  KEY idx_user (user_id, created_at)
) ENGINE=InnoDB COMMENT='诉求/咨询/建议';

DROP TABLE IF EXISTS biz_request_log;
CREATE TABLE biz_request_log (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  request_id VARCHAR(32) NOT NULL,
  status     VARCHAR(16) NOT NULL,
  label      VARCHAR(32) NOT NULL,
  time_text  VARCHAR(32) NOT NULL,
  operator   VARCHAR(32) DEFAULT NULL,
  note       VARCHAR(255) DEFAULT NULL,
  sort       INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_request (request_id, sort)
) ENGINE=InnoDB COMMENT='诉求时间轴';

DROP TABLE IF EXISTS biz_request_reply;
CREATE TABLE biz_request_reply (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  request_id VARCHAR(32) NOT NULL,
  time_text  VARCHAR(32) NOT NULL,
  operator   VARCHAR(32) DEFAULT NULL,
  content    VARCHAR(500) NOT NULL,
  sort       INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_request (request_id, sort)
) ENGINE=InnoDB COMMENT='诉求回复';

DROP TABLE IF EXISTS biz_directory;
CREATE TABLE biz_directory (
  id            VARCHAR(16)  NOT NULL,
  category      VARCHAR(16)  NOT NULL,
  name          VARCHAR(64)  NOT NULL,
  desc_text     VARCHAR(128) DEFAULT NULL,
  phone         VARCHAR(20)  NOT NULL,
  phone_display VARCHAR(20)  DEFAULT NULL,
  hours         VARCHAR(64)  DEFAULT NULL,
  icon          VARCHAR(4)   DEFAULT NULL,
  color         VARCHAR(16)  DEFAULT NULL,
  tint          VARCHAR(16)  DEFAULT NULL,
  sort          INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='服务黄页';

DROP TABLE IF EXISTS biz_job;
CREATE TABLE biz_job (
  id              VARCHAR(16)  NOT NULL,
  title           VARCHAR(64)  NOT NULL,
  company         VARCHAR(64)  NOT NULL,
  salary          VARCHAR(64)  DEFAULT NULL,
  count_num       INT          NOT NULL DEFAULT 1,
  location        VARCHAR(128) DEFAULT NULL,
  tags            JSON         DEFAULT NULL,
  desc_text       TEXT,
  contact         VARCHAR(20)  DEFAULT NULL,
  contact_display VARCHAR(20)  DEFAULT NULL,
  published_at    VARCHAR(16)  DEFAULT NULL,
  deadline        VARCHAR(16)  DEFAULT NULL,
  status          TINYINT      NOT NULL DEFAULT 1,
  sort            INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='就业招聘';

DROP TABLE IF EXISTS biz_tea_meeting;
CREATE TABLE biz_tea_meeting (
  id        VARCHAR(16)  NOT NULL,
  title     VARCHAR(128) NOT NULL,
  meet_date VARCHAR(32)  NOT NULL,
  location  VARCHAR(128) DEFAULT NULL,
  status    VARCHAR(16)  NOT NULL DEFAULT '报名中',
  joined    INT          NOT NULL DEFAULT 0,
  total     INT          NOT NULL DEFAULT 40,
  host      VARCHAR(64)  DEFAULT NULL,
  summary   VARCHAR(500) DEFAULT NULL,
  agenda    JSON         DEFAULT NULL,
  sort      INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='线上奶茶会';

DROP TABLE IF EXISTS ai_suggestion;
CREATE TABLE ai_suggestion (
  id    VARCHAR(16) NOT NULL,
  text  VARCHAR(128) NOT NULL,
  icon  VARCHAR(8)  DEFAULT NULL,
  sort  INT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='AI 推荐问';

DROP TABLE IF EXISTS ai_conversation;
CREATE TABLE ai_conversation (
  id         VARCHAR(32) NOT NULL,
  user_id    VARCHAR(32) NOT NULL,
  title      VARCHAR(64) NOT NULL DEFAULT '新的对话',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted    TINYINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_user (user_id, updated_at)
) ENGINE=InnoDB COMMENT='AI 会话';

DROP TABLE IF EXISTS ai_message;
CREATE TABLE ai_message (
  id              VARCHAR(32) NOT NULL,
  conversation_id VARCHAR(32) NOT NULL,
  user_id         VARCHAR(32) NOT NULL,
  role            VARCHAR(16) NOT NULL COMMENT 'user / assistant',
  content         MEDIUMTEXT  NOT NULL,
  refs            JSON        DEFAULT NULL,
  follow_ups      JSON        DEFAULT NULL,
  feedback        VARCHAR(8)  NOT NULL DEFAULT '',
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conv (conversation_id, created_at)
) ENGINE=InnoDB COMMENT='AI 消息';

DROP TABLE IF EXISTS sys_event_log;
CREATE TABLE sys_event_log (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  user_id    VARCHAR(32)  DEFAULT NULL,
  event_code VARCHAR(64)  NOT NULL,
  page       VARCHAR(128) DEFAULT NULL,
  payload    JSON         DEFAULT NULL,
  ts         BIGINT       DEFAULT NULL,
  ip         VARCHAR(64)  DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_event (event_code, created_at)
) ENGINE=InnoDB COMMENT='埋点';

DROP TABLE IF EXISTS sys_file;
CREATE TABLE sys_file (
  id          VARCHAR(32)  NOT NULL,
  biz_type    VARCHAR(32)  NOT NULL DEFAULT 'avatar',
  biz_id      VARCHAR(32)  DEFAULT NULL,
  url         VARCHAR(512) NOT NULL,
  name        VARCHAR(255) DEFAULT NULL,
  size_bytes  BIGINT       NOT NULL DEFAULT 0,
  file_path   VARCHAR(512) DEFAULT NULL,
  uploader_id VARCHAR(32)  DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='文件';

SET FOREIGN_KEY_CHECKS = 1;
