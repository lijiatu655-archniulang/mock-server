const request = require('../utils/request')

/** 服务黄页：GET /directory */
function getDirectory() {
  return request.get('/directory')
}

/** 就业招聘：GET /jobs */
function getJobs() {
  return request.get('/jobs')
}

/** 线上奶茶会：GET /tea-meetings */
function getTeaMeetings() {
  return request.get('/tea-meetings')
}

module.exports = {
  getDirectory: getDirectory,
  getJobs: getJobs,
  getTeaMeetings: getTeaMeetings
}
