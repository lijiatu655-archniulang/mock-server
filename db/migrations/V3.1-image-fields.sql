-- V3.1 图片字段（通知配图 / 诉求回复图片）
-- 已有库执行一次；用最新 schema.sql 重建库则不需要。
ALTER TABLE cms_notice
  ADD COLUMN images JSON DEFAULT NULL COMMENT '图片 URL 数组，最多 3 张' AFTER article_id;

ALTER TABLE biz_request_reply
  ADD COLUMN images JSON DEFAULT NULL COMMENT '图片 URL 数组，最多 3 张' AFTER content;
