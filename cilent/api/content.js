const request = require('../utils/request')

/** 资讯列表：GET /articles?columnId=&page=&pageSize= */
function getArticles(params) {
  return request.get('/articles', params || {})
}

/** 资讯详情：GET /articles/{id} */
function getArticle(id) {
  return request.get('/articles/' + id)
}

/** 点赞/取消点赞：POST /articles/{id}/like，body { liked } */
function likeArticle(id, liked) {
  return request.post('/articles/' + id + '/like', {
    liked: !!liked
  })
}

module.exports = {
  getArticles: getArticles,
  getArticle: getArticle,
  likeArticle: likeArticle
}
