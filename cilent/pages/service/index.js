const serviceApi = require('../../api/service')

const TABS = [{
  key: 'directory',
  name: '服务黄页',
  title: '服务黄页'
}, {
  key: 'jobs',
  name: '就业招聘',
  title: '就业招聘'
}, {
  key: 'tea',
  name: '线上奶茶会',
  title: '线上奶茶会'
}]

Page({
  data: {
    tabs: TABS,
    tab: 'directory',
    directoryGroups: [],
    jobs: [],
    teas: [],
    signed: {},
    loading: true,
    error: ''
  },

  onLoad(options) {
    const tab = (options && options.tab) || 'directory'
    this.setTab(tab)
    this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll(true)
  },

  setTab(tab) {
    const current = TABS.filter(function (item) {
      return item.key === tab
    })[0] || TABS[0]
    this.setData({ tab: current.key })
    wx.setNavigationBarTitle({ title: current.title })
  },

  onTabTap(e) {
    this.setTab(e.currentTarget.dataset.tab)
  },

  loadAll(isRefresh) {
    const self = this
    if (!this.loadedOnce) this.setData({ loading: true, error: '' })
    Promise.all([
      serviceApi.getDirectory(),
      serviceApi.getJobs(),
      serviceApi.getTeaMeetings()
    ]).then(function (results) {
      const directory = results[0]
      const groups = (directory.categories || []).map(function (category) {
        return {
          name: category,
          list: (directory.list || []).filter(function (item) {
            return item.category === category
          })
        }
      }).filter(function (group) {
        return group.list.length
      })
      self.setData({
        directoryGroups: groups,
        jobs: results[1].list || [],
        teas: (results[2].list || []).map(function (item) {
          return Object.assign({}, item, {
            signed: !!self.data.signed[item.id],
            percent: Math.min(100, Math.round((item.joined / item.total) * 100))
          })
        }),
        loading: false,
        error: ''
      })
      self.loadedOnce = true
      if (isRefresh) wx.stopPullDownRefresh()
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '便民服务加载失败'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/[^0-9]/g, '')
    })
  },

  onSignup(e) {
    const id = e.currentTarget.dataset.id
    const current = this.data.teas.filter(function (item) {
      return item.id === id
    })[0]
    if (!current || current.status !== '报名中') return
    if (current.signed) {
      wx.showToast({ title: '您已报名', icon: 'none' })
      return
    }
    const teas = this.data.teas.map(function (item) {
      if (item.id !== id) return item
      const joined = item.joined + 1
      return Object.assign({}, item, {
        joined: joined,
        percent: Math.min(100, Math.round((joined / item.total) * 100)),
        signed: true
      })
    })
    const signed = Object.assign({}, this.data.signed)
    signed[id] = true
    this.setData({
      teas: teas,
      signed: signed
    })
    wx.showToast({ title: '报名成功，记得按时参加', icon: 'none' })
  },

  retry() {
    this.loadAll()
  }
})
