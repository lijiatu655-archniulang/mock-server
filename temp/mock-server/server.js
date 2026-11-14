/**
 * 新源村情通 · V1 + V2 用户端本地 Mock 服务
 * 用途：验证「前后端分离」链路——小程序把 config.USE_MOCK 改成 false 后，
 *       请求会真正走到 HTTP / SSE，而不只是跑本地 Mock 函数。
 *
 * 启动：node server.js    （默认 http://127.0.0.1:3000）
 * 依赖：无，直接复用 cilent/mock 与 cilent/mock/ai.js
 */
const http = require('http')
const { URL } = require('url')
const path = require('path')

const mock = require(path.join(__dirname, '..', '..', 'cilent', 'mock', 'index.js'))
const ai = require(path.join(__dirname, '..', '..', 'cilent', 'mock', 'ai.js'))

const PORT = Number(process.env.PORT || 3000)
const PREFIX = '/api/v1'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization,x-client,x-client-version')
  res.setHeader('Access-Control-Max-Age', '86400')
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  cors(res)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

function readBody(req) {
  return new Promise(function (resolve) {
    let raw = ''
    req.on('data', function (chunk) {
      raw += chunk
      if (raw.length > 2 * 1024 * 1024) {
        req.destroy()
      }
    })
    req.on('end', function () {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', function () {
      resolve({})
    })
  })
}

function sseWrite(res, event, data) {
  res.write('event: ' + event + '\n')
  res.write('data: ' + JSON.stringify(data || {}) + '\n\n')
}

function streamChat(req, res) {
  readBody(req).then(function (body) {
    const question = String((body && body.question) || '').trim()
    if (!question) {
      sendJson(res, 200, {
        code: 40001,
        message: '请输入您的问题',
        data: null,
        traceId: 'mock_' + Date.now(),
        timestamp: Date.now()
      })
      return
    }

    const result = ai.answerFor(question)
    const conversationId = (body && body.conversationId) || 'cv' + Date.now()
    const messageId = 'm' + Date.now()
    const startedAt = Date.now()
    const chars = result.answer.split('')
    let cursor = 0
    let timer = null
    let closed = false

    cors(res)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    })
    if (res.flushHeaders) res.flushHeaders()

    function send(event, data) {
      if (closed) return
      sseWrite(res, event, data)
    }

    function cleanup() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    req.on('close', function () {
      closed = true
      cleanup()
    })

    timer = setTimeout(function () {
      send('meta', {
        conversationId: conversationId,
        messageId: messageId,
        intent: result.intent,
        needRefs: !!(result.refs && result.refs.length)
      })

      function tick() {
        if (closed) return
        const size = 2 + Math.floor(Math.random() * 3)
        const text = chars.slice(cursor, cursor + size).join('')
        cursor += size
        if (text) send('delta', { text: text })
        if (cursor >= chars.length) {
          timer = setTimeout(function () {
            if (closed) return
            send('refs', { refs: result.refs || [] })
            send('done', {
              conversationId: conversationId,
              messageId: messageId,
              latencyMs: Date.now() - startedAt,
              followUps: result.followUps || []
            })
            closed = true
            res.end()
          }, 180)
          return
        }
        timer = setTimeout(tick, 28)
      }

      timer = setTimeout(tick, 260)
    }, 420)
  })
}

const server = http.createServer(function (req, res) {
  const startedAt = Date.now()
  if (req.method === 'OPTIONS') {
    cors(res)
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, 'http://127.0.0.1')
  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'xct-mock', time: new Date().toISOString() })
    return
  }

  if (!url.pathname.startsWith(PREFIX + '/')) {
    sendJson(res, 404, {
      code: 40400,
      message: '接口不存在：' + req.method + ' ' + url.pathname,
      data: null,
      traceId: 'mock_' + Date.now(),
      timestamp: Date.now()
    })
    return
  }

  const apiPath = url.pathname.slice(PREFIX.length)
  const params = {}
  url.searchParams.forEach(function (value, key) {
    params[key] = value
  })
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const method = req.method.toUpperCase()

  if (apiPath === '/ai/chat/stream' && method === 'POST') {
    streamChat(req, res, params)
    return
  }

  readBody(req).then(function (body) {
    mock.handle({
      url: apiPath,
      method: method,
      params: params,
      data: body,
      token: token
    }).then(function (result) {
      console.log('[mock]', method, url.pathname, '->', result.code, (Date.now() - startedAt) + 'ms')
      sendJson(res, 200, result)
    }).catch(function (err) {
      console.error('[mock] handler error', err)
      sendJson(res, 500, {
        code: 50000,
        message: 'Mock 服务内部错误',
        data: null,
        traceId: 'mock_' + Date.now(),
        timestamp: Date.now()
      })
    })
  })
})

server.listen(PORT, function () {
  console.log('')
  console.log('  新源村情通 · V1 + V2 用户端 Mock API')
  console.log('  地址：http://127.0.0.1:' + PORT + PREFIX)
  console.log('  健康检查：http://127.0.0.1:' + PORT + '/health')
  console.log('  SSE：POST ' + PREFIX + '/ai/chat/stream')
  console.log('')
  console.log('  使用方式：把 cilent/utils/config.js 中 USE_MOCK 改为 false，')
  console.log('  并保持 BASE_URL = http://127.0.0.1:' + PORT + PREFIX)
  console.log('')
})
