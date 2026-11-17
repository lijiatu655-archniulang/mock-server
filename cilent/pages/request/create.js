const ROUTES = {
  consult: '/pages/request/consult/index',
  appeal: '/pages/request/appeal/index',
  suggestion: '/pages/request/suggest/index'
}

Page({
  onLoad(options) {
    const type = (options && options.type) || 'appeal'
    wx.redirectTo({ url: ROUTES[type] || ROUTES.appeal })
  }
})
