const request = require('../utils/request')

function summary() {
  return request.get('/workbench/summary')
}

function getNotices() {
  return request.get('/workbench/notices').then(function (res) {
    if (Array.isArray(res)) return res
    return (res && res.list) || []
  })
}

function createNotice(data) {
  return request.post('/workbench/notices', data || {})
}

function updateNotice(id, data) {
  return request.put('/workbench/notices/' + id, data || {})
}

function deleteNotice(id) {
  return request.del('/workbench/notices/' + id)
}

function getRequests(params) {
  return request.get('/workbench/requests', params || {})
}

function getRequestDetail(id) {
  return request.get('/workbench/requests/' + id)
}

function acceptRequest(id) {
  return request.post('/workbench/requests/' + id + '/accept', {})
}

function replyRequest(id, content) {
  return request.post('/workbench/requests/' + id + '/reply', { content: content })
}

function completeRequest(id) {
  return request.post('/workbench/requests/' + id + '/complete', {})
}

function getHouseholdStatistics(regionId) {
  return request.get('/workbench/statistics/household', regionId ? { regionId: regionId } : {})
}

module.exports = {
  summary: summary,
  getNotices: getNotices,
  createNotice: createNotice,
  updateNotice: updateNotice,
  deleteNotice: deleteNotice,
  getRequests: getRequests,
  getRequestDetail: getRequestDetail,
  acceptRequest: acceptRequest,
  replyRequest: replyRequest,
  completeRequest: completeRequest,
  getHouseholdStatistics: getHouseholdStatistics
}
