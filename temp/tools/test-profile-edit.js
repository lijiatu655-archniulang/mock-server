const store = {}
let back = false
global.wx = {
  getStorageSync: k => (store[k] === undefined ? '' : store[k]),
  setStorageSync: (k, v) => { store[k] = v },
  removeStorageSync: k => { delete store[k] },
  showToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  navigateBack: () => { back = true },
  chooseMedia: () => {}
}
global.getApp = () => ({
  globalData: { user: null },
  setUser: u => { global.appUser = u },
  ensureLogin: () => Promise.resolve(null)
})
global.Page = o => { global.page = o }
require('../../cilent/pages/profile/edit.js')

function setDeep(root, path, value) {
  root[path] = value
}
page.setData = function (patch, cb) {
  Object.keys(patch).forEach(k => setDeep(this.data, k, patch[k]))
  if (cb) cb()
}

const auth = require('../../cilent/api/auth')

;(async () => {
  await auth.mockLogin()
  page.onLoad()
  await new Promise(r => setTimeout(r, 700))
  console.log('loaded', page.data.user.name, page.data.nickname)
  page.onNicknameInput({ detail: { value: '秀兰' } })
  page.onSave()
  await new Promise(r => setTimeout(r, 1200))
  console.log('error', page.data.error, 'back', back, 'saved', global.appUser && global.appUser.nickname)
  if (!back) process.exit(1)
})()
