package com.xinyuan.village.modules.content;

import com.xinyuan.village.common.api.PageResult;
import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.i18n.I18nService;
import com.xinyuan.village.common.util.Times;
import com.xinyuan.village.modules.content.entity.CmsArticle;
import com.xinyuan.village.modules.content.entity.CmsColumn;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentMapper contentMapper;
    private final I18nService i18n;

    public List<Map<String, Object>> columns() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (CmsColumn c : contentMapper.columns()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("code", c.getCode());
            m.put("name", c.getName());
            m.put("shortName", c.getShortName());
            m.put("color", c.getColor());
            m.put("description", c.getDescription());
            m.put("sort", c.getSort());
            i18n.attach(m, "column", c.getId(), "name", "description");
            list.add(m);
        }
        return list;
    }

    public PageResult<Map<String, Object>> page(String columnId, int page, int pageSize) {
        int p = Math.max(1, page);
        int size = Math.min(Math.max(1, pageSize), 50);
        String cid = columnId == null || "all".equals(columnId) ? null : columnId;
        long total = contentMapper.countArticles(cid);
        List<CmsArticle> rows = contentMapper.pageArticles(cid, (p - 1) * size, size);
        List<Map<String, Object>> list = new ArrayList<>();
        for (CmsArticle a : rows) list.add(card(a));
        return PageResult.of(list, total, p, size);
    }

    public Map<String, Object> detail(String id, String userId) {
        CmsArticle a = contentMapper.detail(id);
        if (a == null) throw new BizException(ErrorCode.ARTICLE_NOT_FOUND);
        contentMapper.incView(id);
        a.setViews((a.getViews() == null ? 0 : a.getViews()) + 1);

        Map<String, Object> m = card(a, false);
        m.put("content", a.getContent());
        m.put("displayDate", Times.full(a.getPublishedAt()));
        m.put("author", a.getAuthor());
        m.put("liked", userId != null && contentMapper.liked(id, userId) > 0);

        CmsArticle newer = contentMapper.newer(a.getColumnId(), a.getPublishedAt(), a.getId());
        CmsArticle older = contentMapper.older(a.getColumnId(), a.getPublishedAt(), a.getId());
        m.put("prev", newer == null ? null : Map.of("id", newer.getId(), "title", newer.getTitle()));
        m.put("next", older == null ? null : Map.of("id", older.getId(), "title", older.getTitle()));
        return m;
    }

    public Map<String, Object> like(String articleId, String userId, Boolean wantLiked) {
        CmsArticle a = contentMapper.detail(articleId);
        if (a == null) throw new BizException(ErrorCode.ARTICLE_NOT_FOUND);
        boolean current = contentMapper.liked(articleId, userId) > 0;
        boolean liked = wantLiked == null ? !current : wantLiked;
        if (liked != current) {
            if (liked) {
                contentMapper.insertLike(articleId, userId);
                contentMapper.incLikes(articleId);
            } else {
                contentMapper.deleteLike(articleId, userId);
                contentMapper.decLikes(articleId);
            }
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("liked", liked);
        Integer likes = contentMapper.likes(articleId);
        m.put("likes", likes == null ? 0 : likes);
        return m;
    }

    public Map<String, Object> card(CmsArticle a) {
        return card(a, true);
    }

    private Map<String, Object> card(CmsArticle a, boolean withDisplayDate) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("columnId", a.getColumnId());
        m.put("columnName", a.getColumnName());
        m.put("columnCode", a.getColumnCode());
        m.put("columnColor", a.getColumnColor());
        m.put("title", a.getTitle());
        m.put("summary", a.getSummary());
        m.put("isTop", a.getIsTop() != null && a.getIsTop() == 1);
        m.put("publishedAt", Times.minute(a.getPublishedAt()));
        if (withDisplayDate) m.put("displayDate", Times.friendly(a.getPublishedAt()));
        m.put("views", a.getViews());
        m.put("likes", a.getLikes());
        m.put("source", a.getSource());
        i18n.attach(m, "article", a.getId(), "title", "summary");
        return m;
    }
}