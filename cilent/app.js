const auth = require('./api/auth')
const userApi = require('./api/user')
const config = require('./utils/config')
const storage = require('./utils/storage')

App({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    windowWidth: 375,
    user: null,
    region: null,
    unread: 0,
    appConfig: null
  },

  onLaunch() {
    this.globalData.skipAutoLogin = false
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
   * 启动登录：优先复用 token，其次 Mock 登录，最后留给页面引导登录
   * 不阻塞首页公开数据加载
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
          self.autoLogin().then(resolve)
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
    if (!config.USE_MOCK) {
      // 生产环境静默登录：wx.login → /auth/wx-login；失败不阻塞公开页面
      return auth.wxLogin().then(function (res) {
        self.setUser(res.user)
        return res.user
      }).catch(function (err) {
        console.warn('[auth] wx-login failed', err)
        return null
      })
    }
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
