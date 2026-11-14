const config = require('./config')

const KEY = config.STORAGE

function get(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
  } catch (e) {
    return fallback
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    // 存储失败不阻断业务
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
  } catch (e) {}
}

module.exports = {
  getToken() {
    return get(KEY.TOKEN, '')
  },
  setToken(token) {
    set(KEY.TOKEN, token || '')
  },
  getUser() {
    return get(KEY.USER, null)
  },
  setUser(user) {
    set(KEY.USER, user || null)
  },
  getLiked() {
    return get(KEY.LIKED, {}) || {}
  },
  isLiked(id) {
    return !!this.getLiked()[id]
  },
  markLiked(id, liked) {
    const map = this.getLiked()
    if (liked) map[id] = 1
    else delete map[id]
    set(KEY.LIKED, map)
  },
  getAiHistory() {
    return get(KEY.AI_HISTORY, []) || []
  },
  setAiHistory(list) {
    set(KEY.AI_HISTORY, (list || []).slice(0, 20))
  },
  getAiSessions() {
    const sessions = get(KEY.AI_SESSIONS, [])
    if (sessions && sessions.length) return sessions
    // 兼容旧版扁平 Q&A 历史：迁移成单轮会话并落盘，避免删除后又“复活”
    const old = get(KEY.AI_HISTORY, []) || []
    const converted = old.map(function (item, index) {
      return {
        id: 'legacy_' + index + '_' + (item.at || Date.now()),
        title: String(item.question || '历史会话').slice(0, 30),
        createdAt: item.at || Date.now(),
        updatedAt: item.at || Date.now(),
        conversationId: '',
        messages: [{
          id: 'legacy_u_' + index,
          role: 'user',
          content: item.question || '',
          at: item.at || Date.now()
        }, {
          id: 'legacy_a_' + index,
          role: 'assistant',
          content: item.answer || '',
          refs: [],
          followUps: [],
          feedback: '',
          at: item.at || Date.now()
        }]
      }
    })
    if (converted.length) set(KEY.AI_SESSIONS, converted)
    return converted
  },
  setAiSessions(list) {
    set(KEY.AI_SESSIONS, (list || []).slice(0, 20))
  },
  getPendingSession() {
    return get(KEY.PENDING_SESSION, null)
  },
  setPendingSession(session) {
    set(KEY.PENDING_SESSION, session || null)
  },
  clearPendingSession() {
    remove(KEY.PENDING_SESSION)
  },
  setPendingQuestion(question) {
    set(KEY.PENDING_Q, question || '')
  },
  getPendingQuestion() {
    return get(KEY.PENDING_Q, '')
  },
  clearPendingQuestion() {
    remove(KEY.PENDING_Q)
  },
  clearAuth() {
    remove(KEY.TOKEN)
    remove(KEY.USER)
  }
}
