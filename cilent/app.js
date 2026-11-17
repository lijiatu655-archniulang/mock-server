const auth = require('./api/auth')
const userApi = require('./api/user')
const config = require('./utils/config')
const storage = require('./utils/storage')
const i18n = require('./utils/i18n')

// 所有页面自动注入 lang；语言切换后 reLaunch 会重新取当前语言
const rawPage = Page
Page = function (options) {
  options.data = Object.assign({ lang: i18n.getLang() }, options.data || {})
  const rawOnShow = options.onShow
  options.onShow = function () {
    const lang = i18n.getLang()
    if (this.data.lang !== lang) this.setData({ lang: lang })
    i18n.applyTabBar(lang)
    i18n.applyNavTitle(this.route)
    if (rawOnShow) return rawOnShow.apply(this, arguments)
  }
  return rawPage(options)
}

App({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    windowWidth: 375,
    user: null,
    region: null,
    unread: 0,
    appConfig: null,
    lang: i18n.getLang()
  },

  onLaunch() {
    this.globalData.skipAutoLogin = false
    this.globalData.lang = i18n.getLang()
    i18n.applyTabBar(this.globalData.lang)
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      this.globalData.statusBarHeight = info.statusBarHeight || 20
      this.globalData.windowWidth = info.windowWidth || 375
    } catch (e) {
      this.globalData.statusBarHeight = 20
    }
    this.globalData.navBarHeight = 44
    this.ready = this.bootstrap()
  },

  setUser(user) {
    this.globalData.user = user || null
    if (user) storage.setUser(user)
    return user
  },

  /**
   * 启动登录：优先复用 token；真实后端不再静默登录，
   * 未登录先以游客浏览，AI 等受保护能力由页面引导去个人中心登录。
   */
  bootstrap() {
    const self = this
    return new Promise(function (resolve) {
      const token = storage.getToken()
      if (token) {
        userApi.me().then(function (user) {
          self.setUser(user)
          resolve(user)
        }).catch(function () {
          storage.clearAuth()
          resolve(null)
        })
        return
      }
      self.autoLogin().then(resolve)
    })
  },

  autoLogin() {
    const self = this
    if (this.globalData.skipAutoLogin) return Promise.resolve(null)
    if (config.USE_MOCK && config.AUTO_MOCK_LOGIN) {
      return auth.mockLogin().then(function (res) {
        self.setUser(res.user)
        return res.user
      }).catch(function (err) {
        console.warn('[auth] mock-login failed', err)
        return null
      })
    }
    // 真实后端：不静默登录，必须由用户在个人中心选择微信/账号密码登录
    return Promise.resolve(null)
  },

  /** 页面可 await getApp().ensureLogin() 后再请求受保护接口 */
  ensureLogin() {
    const self = this
    if (this.globalData.user) return Promise.resolve(this.globalData.user)
    if (this.loginPromise) return this.loginPromise
    let task
    if (storage.getToken()) {
      task = userApi.me().then(function (user) {
        return self.setUser(user)
      }).catch(function () {
        storage.clearAuth()
        return self.autoLogin()
      })
    } else {
      task = this.autoLogin()
    }
    this.loginPromise = task.then(function (user) {
      self.loginPromise = null
      return user
    }).catch(function () {
      self.loginPromise = null
      return null
    })
    return this.loginPromise
  },

  logout() {
    this.globalData.user = null
    this.globalData.skipAutoLogin = true
    storage.clearAuth()
  }
})
