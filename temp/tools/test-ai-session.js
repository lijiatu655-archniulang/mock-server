const store = {}
global.wx = {
  getStorageSync: k => (store[k] === undefined ? '' : store[k]),
  setStorageSync: (k, v) => { store[k] = v },
  removeStorageSync: k => { delete store[k] },
  showToast: () => {},
  navigateTo: () => {},
  switchTab: () => {},
  createSelectorQuery: () => ({ select: () => ({ boundingClientRect: () => ({ exec: () => {} }) }) }),
  nextTick: fn => fn(),
  request: () => {},
  login: () => {}
}
global.getApp = () => ({
  globalData: { user: { avatarText: '王' } },
  ensureLogin: () => Promise.resolve({})
})
global.Page = o => { global.page = o }
require('../../cilent/pages/ai/ai.js')

function setDeep(root, path, value) {
  const m = path.match(/^([A-Za-z_$][\w$]*)\[(\d+)\]\.([A-Za-z_$][\w$]*)$/)
  if (m) {
    if (!root[m[1]][Number(m[2])]) root[m[1]][Number(m[2])] = {}
    root[m[1]][Number(m[2])][m[3]] = value
    return
  }
  root[path] = value
}
page.setData = function (patch, cb) {
  Object.keys(patch).forEach(k => setDeep(this.data, k, patch[k]))
  if (cb) cb()
}

const storage = require('../../cilent/utils/storage')

;(async () => {
  page.onLoad()
  await new Promise(r => setTimeout(r, 500))
  console.log('welcome', page.data.messages.length)
  page.setData({
    messages: [
      { id: 'welcome', role: 'assistant', content: 'welcome', streaming: false, refs: [], feedback: '', followUps: [], error: false },
      { id: 'u1', role: 'user', content: '医保怎么缴', at: Date.now() },
      { id: 'a1', role: 'assistant', content: '今年医保 380 元。', refs: [], feedback: '', followUps: [], error: false, at: Date.now() }
    ]
  })
  page.saveSession()
  const sessions = storage.getAiSessions()
  console.log('saved sessions', sessions.length, sessions[0] && sessions[0].messages.length, sessions[0] && sessions[0].title)
  page.restoreSession(sessions[0])
  console.log('restored messages', page.data.messages.length)
  storage.setPendingSession(sessions[0])
  page.data.streaming = false
  page.onShow()
  console.log('pending restored messages', page.data.messages.length)
})()
