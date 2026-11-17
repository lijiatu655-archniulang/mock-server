const config = require('./config')
const storage = require('./storage')
const format = require('./format')
const i18n = require('./i18n')

let mock = null
function getMock() {
  if (!mock) mock = require('../mock/index')
  return mock
}

function normalizeError(message, code, traceId) {
  const err = new Error(message || '网络开小差了，请稍后重试')
  err.code = code || 50000
  err.traceId = traceId || ''
  return err
}

/**
 * 统一请求：始终以 Result 结构 { code, message, data, traceId, timestamp } 兜底
 * 返回 Promise<data>，业务层只处理 data；失败时 reject(Error)
 */
function request(options) {
  const opts = options || {}
  const method = (opts.method || 'GET').toUpperCase()
  const path = opts.url || ''
  const query = format.query(opts.params)
  const fullUrl = config.BASE_URL + path + (query ? '?' + query : '')

  if (config.USE_MOCK) {
    let task
    try {
      task = getMock().handle({
        url: path,
        method: method,
        params: opts.params || {},
        data: opts.data || {},
        token: storage.getToken()
      })
    } catch (e) {
      task = Promise.reject(normalizeError('本地数据加载失败，请重试', 50000))
    }
    return task.then(function (res) {
      if (res && res.code !== 0) {
        throw normalizeError(res.message, res.code, res.traceId)
      }
      return res ? res.data : null
    })
  }

  return new Promise(function (resolve, reject) {
    const header = Object.assign({
      'content-type': 'application/json',
      'X-Client': config.CLIENT,
      'X-Client-Version': config.APP_VERSION,
      'X-Lang': i18n.getLang()
    }, opts.header || {})
    const token = storage.getToken()
    if (token) header.Authorization = 'Bearer ' + token

    wx.request({
      url: fullUrl,
      method: method,
      data: method === 'GET' ? undefined : (opts.data || {}),
      header: header,
      timeout: config.TIMEOUT,
      success: function (res) {
        const body = res.data || {}
        const traceId = body.traceId || res.header['X-Trace-Id'] || ''
        if (res.statusCode === 401 || body.code === 20001) {
          storage.clearAuth()
          reject(normalizeError('登录已过期，请重新进入小程序', 20001, traceId))
          return
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(normalizeError(body.message || '服务暂时不可用（' + res.statusCode + '）', body.code || res.statusCode, traceId))
          return
        }
        if (body.code !== 0) {
          reject(normalizeError(body.message, body.code, traceId))
          return
        }
        resolve(i18n.localizeResponse(body.data))
      },
      fail: function (err) {
        const isTimeout = err && /timeout/i.test(err.errMsg || '')
        reject(normalizeError(isTimeout ? '请求超时，请检查网络后重试' : '网络连接失败，请稍后重试', isTimeout ? 50001 : 50000))
      }
    })
  })
}

request.get = function (url, params, options) {
  return request(Object.assign({ url: url, method: 'GET', params: params }, options || {}))
}

request.post = function (url, data, options) {
  return request(Object.assign({ url: url, method: 'POST', data: data }, options || {}))
}

request.put = function (url, data, options) {
  return request(Object.assign({ url: url, method: 'PUT', data: data }, options || {}))
}

request.del = function (url, data, options) {
  return request(Object.assign({ url: url, method: 'DELETE', data: data }, options || {}))
}

module.exports = request
