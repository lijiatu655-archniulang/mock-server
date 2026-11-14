const request = require('../utils/request')

/** 应用配置：GET /app/config（页脚、免责声明、功能开关） */
function getAppConfig() {
  return request.get('/app/config')
}

/** 埋点上报：POST /events（失败不阻断业务） */
function reportEvent(eventCode, payload) {
  return request.post('/events', {
    eventCode: eventCode,
    payload: payload || {},
    page: typeof getCurrentPages === 'function' && getCurrentPages().length
      ? getCurrentPages()[getCurrentPages().length - 1].route
      : '',
    ts: Date.now()
  }, { silent: true }).catch(function () {
    return null
  })
}

module.exports = {
  getAppConfig: getAppConfig,
  reportEvent: reportEvent
}
