const store = {}
global.wx = {
  getWindowInfo: () => ({ statusBarHeight: 24, windowWidth: 375 }),
  getStorageSync: k => (store[k] === undefined ? '' : store[k]),
  setStorageSync: (k, v) => { store[k] = v },
  removeStorageSync: k => { delete store[k] },
  request: () => {},
  login: () => {}
}
global.App = function (options) {
  global.app = options
  options.onLaunch.call(options)
}
require('../../cilent/app.js')

setTimeout(async () => {
  console.log('ready user:', app.globalData.user && app.globalData.user.name)
  console.log('token:', !!store.xct_token)
  app.logout()
  console.log('after logout user:', app.globalData.user)
  const user = await app.ensureLogin()
  console.log('ensureLogin after logout (should be null):', user)
  app.globalData.skipAutoLogin = false
  const relogin = await app.autoLogin()
  console.log('relogin:', relogin && relogin.name)
}, 1200)
