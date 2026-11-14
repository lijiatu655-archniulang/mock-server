const request = require('../utils/request')

/** 提交诉求/咨询/建议：POST /requests */
function create(data) {
  return request.post('/requests', data || {})
}

/** 我的诉求：GET /requests?status= */
function list(params) {
  return request.get('/requests', params || {})
}

/** 诉求详情：GET /requests/{id} */
function detail(id) {
  return request.get('/requests/' + id)
}

/** 满意度评价：POST /requests/{id}/rate */
function rate(id, score, comment) {
  return request.post('/requests/' + id + '/rate', {
    score: score,
    comment: comment || ''
  })
}

/** 催办：POST /requests/{id}/urge */
function urge(id) {
  return request.post('/requests/' + id + '/urge', {})
}

module.exports = {
  create: create,
  list: list,
  detail: detail,
  rate: rate,
  urge: urge
}
