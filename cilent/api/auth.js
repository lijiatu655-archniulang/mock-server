const request = require('../utils/request')
const storage = require('../utils/storage')
const config = require('../utils/config')

function persist(res) {
  if (res && res.token) storage.setToken(res.token)
  if (res && res.user) storage.setUser(res.user)
  return res
}

/** 开发态模拟登录：POST /auth/mock-login（生产环境 404） */
function mockLogin() {
  return request.post('/auth/mock-login', {
    regionId: config.REGION_ID
  }).then(persist)
}

/** 微信静默登录：wx.login -> POST /auth/wx-login */
function wxLogin() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (!res.code) {
          reject(new Error('微信登录失败，请重试'))
          return
        }
        request.post('/auth/wx-login', {
          code: res.code,
          regionId: config.REGION_ID
        }).then(persist).then(resolve).catch(reject)
      },
      fail: function () {
        reject(new Error('微信登录失败，请检查网络'))
      }
    })
  })
}

/** 退出登录：POST /auth/logout */
function logout() {
  return request.post('/auth/logout', {}).then(function () {
    storage.clearAuth()
    return true
  }).catch(function () {
    storage.clearAuth()
    return true
  })
}

module.exports = {
  mockLogin: mockLogin,
  wxLogin: wxLogin,
  logout: logout
}
