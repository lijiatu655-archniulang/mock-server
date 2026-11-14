package com.xinyuan.village.modules.content;

import com.xinyuan.village.modules.content.entity.CmsArticle;
import com.xinyuan.village.modules.content.entity.CmsColumn;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ContentMapper {

    String CARD_SELECT = "SELECT a.*, c.name AS column_name, c.code AS column_code, c.color AS column_color "
            + "FROM cms_article a LEFT JOIN cms_column c ON c.id = a.column_id "
            + "WHERE a.status = 'PUBLISHED' ";

    @Select("SELECT * FROM cms_column WHERE status = 1 ORDER BY sort, id")
    List<CmsColumn> columns();

    @Select({
            "<script>",
            CARD_SELECT,
            "<if test=\"columnId != null and columnId != ''\"> AND a.column_id = #{columnId} </if>",
            "ORDER BY a.is_top DESC, a.published_at DESC, a.id DESC",
            "LIMIT #{offset}, #{pageSize}",
            "</script>"
    })
    List<CmsArticle> pageArticles(@Param("columnId") String columnId,
                                  @Param("offset") int offset, @Param("pageSize") int pageSize);

    @Select({
            "<script>",
            "SELECT COUNT(*) FROM cms_article a WHERE a.status = 'PUBLISHED'",
            "<if test=\"columnId != null and columnId != ''\"> AND a.column_id = #{columnId} </if>",
            "</script>"
    })
    long countArticles(@Param("columnId") String columnId);

    @Select(CARD_SELECT + " AND a.id = #{id}")
    CmsArticle detail(String id);

    @Select("SELECT id, column_id, title, summary, content, source, author, published_at "
            + "FROM cms_article WHERE status = 'PUBLISHED' ORDER BY published_at DESC")
    List<CmsArticle> allArticles();

    @Select("SELECT a.*, c.name AS column_name, c.code AS column_code, c.color AS column_color "
            + "FROM cms_article a LEFT JOIN cms_column c ON c.id = a.column_id "
            + "WHERE a.column_id = #{columnId} AND a.id = #{id}")
    CmsArticle withColumn(@Param("columnId") String columnId, @Param("id") String id);

    @Select("SELECT * FROM cms_article WHERE column_id = #{columnId} AND status = 'PUBLISHED' "
            + "AND (published_at > #{publishedAt} OR (published_at = #{publishedAt} AND id > #{id})) "
            + "ORDER BY published_at ASC, id ASC LIMIT 1")
    CmsArticle newer(@Param("columnId") String columnId, @Param("publishedAt") java.time.LocalDateTime publishedAt,
                     @Param("id") String id);

    @Select("SELECT * FROM cms_article WHERE column_id = #{columnId} AND status = 'PUBLISHED' "
            + "AND (published_at < #{publishedAt} OR (published_at = #{publishedAt} AND id < #{id})) "
            + "ORDER BY published_at DESC, id DESC LIMIT 1")
    CmsArticle older(@Param("columnId") String columnId, @Param("publishedAt") java.time.LocalDateTime publishedAt,
                     @Param("id") String id);

    @Update("UPDATE cms_article SET views = views + 1 WHERE id = #{id}")
    int incView(String id);

    @Select("SELECT COUNT(*) FROM cms_article_like WHERE article_id = #{articleId} AND user_id = #{userId}")
    int liked(@Param("articleId") String articleId, @Param("userId") String userId);

    @Insert("INSERT IGNORE INTO cms_article_like (article_id, user_id) VALUES (#{articleId}, #{userId})")
    int insertLike(@Param("articleId") String articleId, @Param("userId") String userId);

    @Delete("DELETE FROM cms_article_like WHERE article_id = #{articleId} AND user_id = #{userId}")
    int deleteLike(@Param("articleId") String articleId, @Param("userId") String userId);

    @Update("UPDATE cms_article SET likes = GREATEST(0, likes + 1) WHERE id = #{id}")
    int incLikes(String id);

    @Update("UPDATE cms_article SET likes = GREATEST(0, likes - 1) WHERE id = #{id}")
    int decLikes(String id);

    @Select("SELECT likes FROM cms_article WHERE id = #{id}")
    Integer likes(String id);
}
