const config = require('../utils/config')
const request = require('../utils/request')
const storage = require('../utils/storage')
const sse = require('../utils/sse')
const i18n = require('../utils/i18n')

/** 推荐问题：GET /ai/suggestions */
function getSuggestions() {
  return request.get('/ai/suggestions')
}

/** 同步回答（降级）：POST /ai/chat */
function chat(payload) {
  return request.post('/ai/chat', payload)
}

/** 点赞/点踩：POST /ai/messages/{id}/feedback */
function feedback(messageId, type) {
  return request.post('/ai/messages/' + messageId + '/feedback', {
    feedback: type
  })
}

/** 历史会话：GET /ai/conversations */
function getConversations(params) {
  return request.get('/ai/conversations', params || {})
}

/** 会话消息：GET /ai/conversations/{id}/messages */
function getMessages(conversationId) {
  return request.get('/ai/conversations/' + conversationId + '/messages')
}

/** 删除会话：DELETE /ai/conversations/{id} */
function deleteConversation(conversationId) {
  return request.del('/ai/conversations/' + conversationId)
}

function mockStream(options) {
  const mockAi = require('../mock/ai')
  const question = String(options.question || '')
  const result = mockAi.answerFor(question)
  const conversationId = options.conversationId || 'cv' + Date.now()
  const messageId = 'm' + Date.now()
  const startedAt = Date.now()
  const chars = result.answer.split('')
  let cursor = 0
  let timer = null
  let finished = false
  let stopped = false

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function finish(extra) {
    if (finished) return
    finished = true
    clear()
    if (options.onRefs && result.refs && result.refs.length) {
      options.onRefs(result.refs)
    }
    if (options.onDone) {
      options.onDone(Object.assign({
        conversationId: conversationId,
        messageId: messageId,
        latencyMs: Date.now() - startedAt,
        followUps: result.followUps || [],
        stopped: stopped
      }, extra || {}))
    }
  }

  function tick() {
    if (finished) return
    const size = 2 + Math.floor(Math.random() * 3)
    const chunk = chars.slice(cursor, cursor + size).join('')
    cursor += size
    if (chunk && options.onDelta) options.onDelta(chunk)
    if (cursor >= chars.length) {
      timer = setTimeout(function () {
        finish()
      }, 220)
      return
    }
    timer = setTimeout(tick, 26 + Math.floor(Math.random() * 22))
  }

  timer = setTimeout(function () {
    if (finished) return
    if (options.onMeta) {
      options.onMeta({
        conversationId: conversationId,
        messageId: messageId,
        intent: result.intent,
        needRefs: !!(result.refs && result.refs.length)
      })
    }
    timer = setTimeout(tick, 260)
  }, 420)

  return {
    abort: function () {
      if (finished) return
      stopped = true
      finish({ stopped: true })
    }
  }
}

function realStream(options) {
  const token = storage.getToken()
  let buffer = ''
  let finished = false
  let stopped = false
  let gotData = false
  let task = null
  const decode = sse.createDecoder()

  function finish(payload) {
    if (finished) return
    finished = true
    if (options.onDone) options.onDone(payload || {})
  }

  function onEvent(name, payload) {
    if (name === 'meta' || name === 'delta' || name === 'refs' || name === 'done') {
      gotData = true
    }
    if (name === 'meta' && options.onMeta) options.onMeta(payload)
    else if (name === 'delta' && options.onDelta) options.onDelta(payload.text || '')
    else if (name === 'refs' && options.onRefs) options.onRefs(payload.refs || [])
    else if (name === 'done') finish(payload)
    else if (name === 'error') {
      finished = true
      if (options.onError) options.onError(new Error((payload && payload.message) || 'AI 服务暂时不可用'))
    }
  }

  task = wx.request({
    url: config.BASE_URL + '/ai/chat/stream',
    method: 'POST',
    timeout: 60000,
    enableChunked: true,
    responseType: 'arraybuffer',
    header: {
      'content-type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: token ? 'Bearer ' + token : '',
      'X-Client': config.CLIENT,
      'X-Client-Version': config.APP_VERSION,
      'X-Lang': i18n.getLang()
    },
    data: {
      question: options.question,
      conversationId: options.conversationId || ''
    },
    success: function (res) {
      if (res.statusCode === 401 || res.statusCode === 20001) {
        finished = true
        storage.clearAuth()
        if (options.onError) options.onError(new Error('登录已过期，请到个人中心重新登录'))
        return
      }
      if (res.statusCode !== 200) {
        let message = 'AI 服务暂时不可用'
        try {
          const text = res.data instanceof ArrayBuffer ? sse.decodeUtf8(res.data) : JSON.stringify(res.data)
          const body = JSON.parse(text)
          message = body.message || message
        } catch (e) {}
        finished = true
        if (options.onError) options.onError(new Error(message))
        return
      }
      // 服务端未发 done 事件时兜底收尾；完全没有数据则走降级
      if (!finished) {
        if (gotData) {
          finish({ stopped: stopped })
        } else if (options.onError) {
          finished = true
          options.onError(new Error('AI 服务连接已断开，请重试'))
        }
      }
    },
    fail: function (err) {
      if (stopped) return
      finished = true
      if (options.onError) {
        options.onError(new Error((err && err.errMsg) ? '连接中断，请稍后重试' : 'AI 服务连接失败'))
      }
    }
  })

  if (task && task.onChunkReceived) {
    task.onChunkReceived(function (res) {
      if (finished || stopped) return
      buffer += decode(res.data)
      buffer = sse.consume(buffer, onEvent)
    })
  }

  return {
    abort: function () {
      if (finished) return
      stopped = true
      if (task && task.abort) task.abort()
      finish({ stopped: true })
    }
  }
}

/** 流式对话：Mock 逐字模拟 / 真实 SSE（POST /ai/chat/stream） */
function chatStream(options) {
  return config.USE_MOCK ? mockStream(options) : realStream(options)
}

module.exports = {
  getSuggestions: getSuggestions,
  chat: chat,
  chatStream: chatStream,
  feedback: feedback,
  getConversations: getConversations,
  getMessages: getMessages,
  deleteConversation: deleteConversation
}
