const request = require('../utils/request')

/** 政务分类：GET /gov/categories */
function getCategories() {
  return request.get('/gov/categories')
}

/** 事项列表：GET /gov/items?categoryId=&keyword= */
function getItems(params) {
  return request.get('/gov/items', params || {})
}

/** 事项详情：GET /gov/items/{code} */
function getItem(code) {
  return request.get('/gov/items/' + code)
}

/** 提交申报：POST /gov/applies */
function createApply(data) {
  return request.post('/gov/applies', data || {})
}

/** 我的办件：GET /gov/applies?status= */
function getApplies(params) {
  return request.get('/gov/applies', params || {})
}

/** 办件详情：GET /gov/applies/{id} */
function getApply(id) {
  return request.get('/gov/applies/' + id)
}

/** 撤销办件：POST /gov/applies/{id}/cancel */
function cancelApply(id, reason) {
  return request.post('/gov/applies/' + id + '/cancel', {
    reason: reason || ''
  })
}

/** 办件评价：POST /gov/applies/{id}/rate */
function rateApply(id, score, comment) {
  return request.post('/gov/applies/' + id + '/rate', {
    score: score,
    comment: comment || ''
  })
}

module.exports = {
  getCategories: getCategories,
  getItems: getItems,
  getItem: getItem,
  createApply: createApply,
  getApplies: getApplies,
  getApply: getApply,
  cancelApply: cancelApply,
  rateApply: rateApply
}
