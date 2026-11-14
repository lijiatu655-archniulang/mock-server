const storage = require('../../utils/storage')
const format = require('../../utils/format')

Page({
  data: {
    sessions: []
  },

  onShow() {
    this.loadSessions()
  },

  loadSessions() {
    const list = storage.getAiSessions().slice().sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    }).map(function (session) {
      const messages = session.messages || []
      const last = messages[messages.length - 1] || {}
      const raw = String(last.content || session.title || '').replace(/\n/g, ' ')
      return {
        id: session.id,
        title: session.title || '历史会话',
        preview: raw.slice(0, 100),
        count: messages.length,
        timeText: format.friendlyDate(new Date(session.updatedAt || session.createdAt || Date.now())),
        lastRole: last.role === 'user' ? '你问' : '小贾答',
        raw: session
      }
    })
    this.setData({ sessions: list })
  },

  onContinue(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.sessions.filter(function (session) {
      return session.id === id
    })[0]
    if (!item) return
    storage.setPendingSession(item.raw)
    wx.switchTab({ url: '/pages/ai/ai' })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const self = this
    wx.showModal({
      title: '删除这段会话',
      content: '只删除本机记录，不影响其他内容。',
      confirmText: '删除',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        const list = storage.getAiSessions().filter(function (session) {
          return session.id !== id
        })
        storage.setAiSessions(list)
        if (!list.length) storage.setAiHistory([])
        self.loadSessions()
        wx.showToast({ title: '已删除', icon: 'none' })
      }
    })
  },

  onClear() {
    const self = this
    wx.showModal({
      title: '清空历史会话',
      content: '确定清空本机全部 AI 会话吗？',
      confirmText: '清空',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        storage.setAiSessions([])
        storage.setAiHistory([])
        self.loadSessions()
        wx.showToast({ title: '已清空', icon: 'none' })
      }
    })
  },

  onAsk() {
    wx.switchTab({ url: '/pages/ai/ai' })
  }
})
