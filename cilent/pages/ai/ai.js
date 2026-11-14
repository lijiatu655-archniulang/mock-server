const app = getApp()
const aiApi = require('../../api/ai')
const storage = require('../../utils/storage')

const WELCOME = '您好，我是新源村 AI 网格员“小贾”。医保缴费、养老参保、独生子女证、高龄补贴……村里的事都可以问我。\n\n我会尽量给出政策依据；查不到的我也会直说，不会编造。请问您想了解什么？'

Page({
  data: {
    userAvatar: '王',
    messages: [],
    suggestions: [],
    input: '',
    canSend: false,
    streaming: false,
    scrollInto: '',
    showScrollBottom: false,
    disclaimer: 'AI 生成内容仅供参考，具体政策以官方发布为准。',
    loadingSuggestions: true
  },

  onLoad() {
    this.session = 0
    this.conversationId = ''
    this.sessionId = 's' + Date.now()
    this.sessionStartedAt = Date.now()
    this.atBottom = true
    this.scrollViewHeight = 0
    const user = app.globalData.user
    this.setData({
      userAvatar: (user && user.avatarText) || '王',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME,
        streaming: false,
        refs: [],
        feedback: '',
        followUps: [],
        error: false,
        stopped: false
      }]
    })
    this.loadSuggestions()
    app.ensureLogin().then(function () {
      // 静默完成登录，发送时无需再等待
    }).catch(function () {})
  },

  onReady() {
    const self = this
    const query = wx.createSelectorQuery()
    query.select('.chat-scroll').boundingClientRect(function (rect) {
      if (rect) self.scrollViewHeight = rect.height
    }).exec()
  },

  onShow() {
    const pendingSession = storage.getPendingSession()
    if (pendingSession) {
      storage.clearPendingSession()
      if (this.data.streaming) this.stopStream(true)
      this.restoreSession(pendingSession)
      return
    }
    const pending = storage.getPendingQuestion()
    if (!pending) return
    if (this.data.streaming) return
    storage.clearPendingQuestion()
    this.setData({
      input: pending,
      canSend: true
    })
    const self = this
    setTimeout(function () {
      self.sendQuestion(pending)
    }, 260)
  },

  restoreSession(session) {
    if (!session || !session.messages || !session.messages.length) return
    this.session += 1
    this.stopStream(true)
    this.sessionId = session.id || ('s' + Date.now())
    this.sessionStartedAt = session.createdAt || Date.now()
    this.conversationId = session.conversationId || ''
    const messages = session.messages.filter(function (msg) {
      return msg && msg.role
    }).map(function (msg, index) {
      return {
        id: msg.id || ('restore_' + index),
        role: msg.role,
        content: msg.content || '',
        streaming: false,
        refs: msg.refs || [],
        feedback: msg.feedback || '',
        followUps: msg.followUps || [],
        error: false,
        stopped: false,
        serverMessageId: msg.serverMessageId || '',
        question: msg.question || '',
        at: msg.at || Date.now()
      }
    })
    this.atBottom = true
    this.setData({
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME,
        streaming: false,
        refs: [],
        feedback: '',
        followUps: [],
        error: false,
        stopped: false
      }].concat(messages),
      input: '',
      canSend: false,
      streaming: false,
      showScrollBottom: false
    })
    this.scrollToBottom(true)
  },

  onChatScroll(e) {
    const detail = e.detail || {}
    if (!this.scrollViewHeight || !detail.scrollHeight) return
    const distance = detail.scrollHeight - detail.scrollTop - this.scrollViewHeight
    const atBottom = distance < 120
    this.atBottom = atBottom
    if (this.data.showScrollBottom !== !atBottom) {
      this.setData({ showScrollBottom: !atBottom })
    }
  },

  onScrollToBottom() {
    this.atBottom = true
    this.setData({ showScrollBottom: false })
    this.scrollToBottom(true)
  },

  onHistory() {
    this.saveSession()
    wx.navigateTo({ url: '/pages/ai/history' })
  },

  onUnload() {
    this.saveSession()
    this.session += 1
    this.stopStream(true)
  },

  saveSession() {
    const list = this.data.messages.filter(function (msg) {
      if (!msg || !msg.role) return false
      if (String(msg.id || '').indexOf('welcome') === 0) return false
      if (msg.role === 'assistant' && !msg.content) return false
      return true
    })
    if (!list.length) return
    const firstUser = list.filter(function (msg) {
      return msg.role === 'user'
    })[0]
    const title = String((firstUser && firstUser.content) || '新对话').slice(0, 30)
    const messages = list.map(function (msg, index) {
      return {
        id: msg.id || ('m_' + index),
        role: msg.role,
        content: msg.content || '',
        refs: msg.refs || [],
        followUps: msg.followUps || [],
        feedback: msg.feedback || '',
        serverMessageId: msg.serverMessageId || '',
        question: msg.question || '',
        at: msg.at || Date.now()
      }
    })
    const session = {
      id: this.sessionId,
      title: title,
      createdAt: this.sessionStartedAt,
      updatedAt: Date.now(),
      conversationId: this.conversationId,
      messages: messages
    }
    const sessions = storage.getAiSessions().filter(function (item) {
      return item.id !== session.id
    })
    sessions.unshift(session)
    storage.setAiSessions(sessions)
  },

  loadSuggestions() {
    const self = this
    aiApi.getSuggestions().then(function (res) {
      const patch = {
        suggestions: res.list || [],
        disclaimer: res.disclaimer || self.data.disclaimer,
        loadingSuggestions: false
      }
      if (res.welcome && self.data.messages.length === 1 && self.data.messages[0].id === 'welcome') {
        patch['messages[0].content'] = res.welcome
      }
      self.setData(patch)
    }).catch(function () {
      self.setData({ loadingSuggestions: false })
    })
  },

  onInput(e) {
    const value = e.detail.value || ''
    this.setData({
      input: value,
      canSend: !!value.trim() && !this.data.streaming
    })
  },

  onSuggestion(e) {
    this.sendQuestion(e.currentTarget.dataset.text)
  },

  onFollowUp(e) {
    this.sendQuestion(e.currentTarget.dataset.text)
  },

  onSend() {
    if (this.data.streaming) return
    const text = this.data.input.trim()
    if (!text) {
      wx.showToast({ title: '先输入您想问的事', icon: 'none' })
      return
    }
    this.sendQuestion(text)
  },

  onSendOrStop() {
    if (this.data.streaming) {
      this.onStop()
      return
    }
    this.onSend()
  },

  sendQuestion(text) {
    const question = String(text || '').trim()
    if (!question) return
    if (this.data.streaming) {
      wx.showToast({ title: '小贾正在回答，请稍候', icon: 'none' })
      return
    }
    const messages = this.data.messages.slice()
    const now = Date.now()
    messages.push({
      id: 'u' + now,
      role: 'user',
      content: question,
      streaming: false,
      refs: [],
      feedback: '',
      followUps: [],
      error: false,
      at: now
    })
    const aiIndex = messages.length
    messages.push({
      id: 'a' + now,
      role: 'assistant',
      content: '',
      streaming: true,
      refs: [],
      feedback: '',
      followUps: [],
      error: false,
      stopped: false,
      serverMessageId: '',
      question: question,
      at: now
    })
    this.atBottom = true
    this.setData({
      messages: messages,
      input: '',
      canSend: false,
      streaming: true,
      showScrollBottom: false
    })
    this.scrollToBottom(true)
    this.startStream(question, aiIndex, this.session)
  },

  startStream(question, aiIndex, session) {
    const self = this
    let buffer = ''
    let dirty = false
    let syncTimer = null
    let fellBack = false
    const startedAt = Date.now()

    function flush(force) {
      if (session !== self.session) return
      if (!dirty && !force) return
      dirty = false
      const key = 'messages[' + aiIndex + '].content'
      const payload = {}
      payload[key] = buffer
      self.setData(payload)
    }

    function schedule() {
      dirty = true
      if (syncTimer) return
      syncTimer = setTimeout(function () {
        syncTimer = null
        flush()
        self.scrollToBottom()
      }, 70)
    }

    function finalize(extra) {
      if (session !== self.session) return
      if (syncTimer) {
        clearTimeout(syncTimer)
        syncTimer = null
      }
      const data = Object.assign({
        content: buffer,
        streaming: false,
        stopped: false,
        error: false,
        refs: self.pendingRefs || [],
        followUps: self.pendingFollowUps || [],
        serverMessageId: self.pendingServerMessageId || '',
        latencyMs: Date.now() - startedAt
      }, extra || {})
      const key = 'messages[' + aiIndex + ']'
      const payload = {}
      payload[key] = Object.assign({}, self.data.messages[aiIndex], data)
      self.setData(payload)
      self.setData({
        streaming: false,
        canSend: !!self.data.input.trim()
      })
      self.pendingRefs = []
      self.pendingFollowUps = []
      self.pendingServerMessageId = ''
      if (!data.error) self.saveSession()
      self.scrollToBottom()
    }

    self.pendingRefs = []
    self.pendingFollowUps = []
    self.pendingServerMessageId = ''

    app.ensureLogin().then(function () {
      if (session !== self.session) return
      // 登录等待期间用户可能已经点了“停止”
      if (!self.data.streaming) return
      self.currentTask = aiApi.chatStream({
        question: question,
        conversationId: self.conversationId,
        onMeta: function (meta) {
          if (session !== self.session) return
          if (meta.conversationId) self.conversationId = meta.conversationId
          if (meta.messageId) self.pendingServerMessageId = meta.messageId
        },
        onDelta: function (chunk) {
          if (session !== self.session) return
          buffer += chunk
          schedule()
        },
        onRefs: function (refs) {
          if (session !== self.session) return
          self.pendingRefs = refs || []
          const key = 'messages[' + aiIndex + '].refs'
          const payload = {}
          payload[key] = refs || []
          self.setData(payload)
        },
        onDone: function (info) {
          if (session !== self.session) return
          self.pendingFollowUps = (info && info.followUps) || []
          if (info && info.messageId && !self.pendingServerMessageId) {
            self.pendingServerMessageId = info.messageId
          }
          finalize({
            stopped: !!(info && info.stopped)
          })
          self.currentTask = null
        },
        onError: function (err) {
          if (session !== self.session) return
          self.currentTask = null
          const message = (err && err.message) || 'AI 服务暂时不可用'
          // SSE 失败时自动降级到同步接口，避免用户看到空白
          if (!buffer && !fellBack) {
            fellBack = true
            aiApi.chat({
              question: question,
              conversationId: self.conversationId
            }).then(function (res) {
              if (session !== self.session) return
              if (res.conversationId) self.conversationId = res.conversationId
              self.pendingServerMessageId = res.messageId || ''
              self.pendingRefs = res.refs || []
              self.pendingFollowUps = res.followUps || []
              finalize({
                content: res.answer || '',
                degraded: true,
                error: false
              })
            }).catch(function () {
              if (session !== self.session) return
              finalize({
                content: '抱歉，AI 服务暂时不可用。您可以稍后重试，或拨打村党群服务中心电话 0999-5021688。',
                error: true
              })
            })
            return
          }
          finalize({
            content: buffer || ('抱歉，' + message + '。您可以稍后重试，或拨打村党群服务中心电话 0999-5021688。'),
            error: !buffer
          })
        }
      })
    }).catch(function () {
      if (session !== self.session) return
      finalize({
        content: '登录已过期，请退出小程序后重新进入。',
        error: true
      })
    })
  },

  stopStream(silent) {
    if (this.currentTask) {
      this.currentTask.abort()
      this.currentTask = null
    }
    if (!silent && this.data.streaming) {
      this.setData({ streaming: false, canSend: !!this.data.input.trim() })
    }
  },

  onStop() {
    if (!this.data.streaming) return
    this.stopStream(false)
    this.markPendingStopped()
    this.saveSession()
    wx.showToast({ title: '已停止生成', icon: 'none' })
  },

  markPendingStopped() {
    const list = this.data.messages
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const msg = list[i]
      if (msg.role === 'assistant' && msg.streaming) {
        const key = 'messages[' + i + ']'
        const payload = {}
        payload[key + '.streaming'] = false
        payload[key + '.stopped'] = !!msg.content
        if (!msg.content) {
          payload[key + '.content'] = '已停止生成。您可以继续问其他问题。'
        }
        this.setData(payload)
        return
      }
    }
  },

  onFeedback(e) {
    const ds = e.currentTarget.dataset
    const index = Number(ds.index)
    const type = ds.type
    const msg = this.data.messages[index]
    if (!msg) return
    if (msg.feedback === type) return
    const self = this
    const key = 'messages[' + index + '].feedback'
    const payload = {}
    payload[key] = type
    this.setData(payload)
    this.saveSession()
    if (!msg.serverMessageId) {
      wx.showToast({ title: '感谢您的反馈', icon: 'none' })
      return
    }
    aiApi.feedback(msg.serverMessageId, type).then(function () {
      wx.showToast({ title: '感谢您的反馈', icon: 'none' })
    }).catch(function () {
      wx.showToast({ title: '反馈已记录', icon: 'none' })
    })
  },

  onCopy(e) {
    const text = e.currentTarget.dataset.text || ''
    if (!text) return
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({ title: '已复制', icon: 'none' })
      }
    })
  },

  onRefTap(e) {
    const route = e.currentTarget.dataset.route
    if (!route) return
    wx.navigateTo({ url: route })
  },

  onRetry(e) {
    const question = e.currentTarget.dataset.question
    if (question) this.sendQuestion(question)
  },

  onRegenerate(e) {
    if (this.data.streaming) return
    const index = Number(e.currentTarget.dataset.index)
    const msg = this.data.messages[index]
    if (!msg || msg.role !== 'assistant' || !msg.question) return
    this.session += 1
    this.stopStream(true)
    const messages = this.data.messages.slice(0, index)
    const now = Date.now()
    const aiIndex = messages.length
    messages.push({
      id: 'a' + now,
      role: 'assistant',
      content: '',
      streaming: true,
      refs: [],
      feedback: '',
      followUps: [],
      error: false,
      stopped: false,
      serverMessageId: '',
      question: msg.question,
      at: now
    })
    this.atBottom = true
    this.setData({
      messages: messages,
      streaming: true,
      canSend: false,
      showScrollBottom: false
    })
    this.scrollToBottom(true)
    this.startStream(msg.question, aiIndex, this.session)
  },

  onNewChat() {
    const self = this
    wx.showModal({
      title: '开始新对话',
      content: '当前对话内容将被清空，确定继续吗？',
      confirmText: '新对话',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        self.saveSession()
        self.session += 1
        self.stopStream(true)
        self.conversationId = ''
        self.sessionId = 's' + Date.now()
        self.sessionStartedAt = Date.now()
        self.atBottom = true
        self.setData({
          messages: [{
            id: 'welcome-' + Date.now(),
            role: 'assistant',
            content: WELCOME,
            streaming: false,
            refs: [],
            feedback: '',
            followUps: [],
            error: false,
            stopped: false
          }],
          input: '',
          canSend: false,
          streaming: false,
          scrollInto: '',
          showScrollBottom: false
        })
      }
    })
  },

  scrollToBottom(force) {
    if (!force && this.atBottom === false) {
      if (!this.data.showScrollBottom) this.setData({ showScrollBottom: true })
      return
    }
    if (!force && this.scrollLock) return
    this.scrollLock = true
    const self = this
    setTimeout(function () {
      self.scrollLock = false
      self.setData({ scrollInto: '' }, function () {
        wx.nextTick(function () {
          self.setData({ scrollInto: 'chat-bottom' })
        })
      })
    }, force ? 30 : 90)
  },

  onShareAppMessage() {
    return {
      title: '新源小贾 · 村里的 AI 网格员',
      path: '/pages/ai/ai'
    }
  }
})
