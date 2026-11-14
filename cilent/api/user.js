const request = require('../utils/request')

/** 当前用户：GET /users/me */
function me() {
  return request.get('/users/me')
}

/** 修改资料：PUT /users/me */
function updateMe(data) {
  return request.put('/users/me', data)
}

/** 区域树：GET /regions/tree */
function getRegionTree() {
  return request.get('/regions/tree')
}

/** 字典：GET /dicts/{type} */
function getDict(type) {
  return request.get('/dicts/' + type)
}

module.exports = {
  me: me,
  updateMe: updateMe,
  getRegionTree: getRegionTree,
  getDict: getDict
}
