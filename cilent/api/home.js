const request = require('../utils/request')

/** 首页聚合接口：GET /home（一次请求拿齐首屏数据） */
function getHome(params) {
  return request.get('/home', params || {})
}

/** 九宫格入口：GET /modules */
function getModules(params) {
  return request.get('/modules', params || {})
}

/** 栏目胶囊：GET /columns */
function getColumns() {
  return request.get('/columns')
}

module.exports = {
  getHome: getHome,
  getModules: getModules,
  getColumns: getColumns
}
