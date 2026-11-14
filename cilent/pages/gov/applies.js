const govApi = require('../../api/gov')

function decorate(item) {
  const amount = Number(item.amount || 0)
  return Object.assign({}, item, {
    amountText: amount > 0 ? (amount / 100).toFixed(2).replace(/\.00$/, '') + ' 元' : '免费',
    createdDate: String(item.createdAt || '').slice(5, 10),
    statusClass: item.status === 'COMPLETED' ? 'done'
      : item.status === 'CANCELED' || item.status === 'REJECTED' ? 'muted'
        : item.status === 'SUPPLEMENT' ? 'warn' : 'processing'
  })
}

Page({
  data: {
    all: [],
    applies: [],
    filter: 'all',
    loading: true,
    error: '',
    counts: {
      all: 0,
      processing: 0,
      done: 0
    }
  },

  onLoad() {
    this.loadApplies()
  },

  onShow() {
    if (this.loadedOnce) this.loadApplies()
  },

  onPullDownRefresh() {
    this.loadApplies(true)
  },

  loadApplies(isRefresh) {
    const self = this
    if (!this.loadedOnce) this.setData({ loading: true, error: '' })
    govApi.getApplies({}).then(function (res) {
      const all = (res.list || []).map(decorate)
      const processing = all.filter(function (item) {
        return ['SUBMITTED', 'ACCEPTED', 'SUPPLEMENT', 'APPROVED', 'PAID'].indexOf(item.status) >= 0
      }).length
      self.setData({
        all: all,
        loading: false,
        error: '',
        counts: {
          all: all.length,
          processing: processing,
          done: all.length - processing
        }
      })
      self.loadedOnce = true
      self.applyFilter(self.data.filter)
      if (isRefresh) wx.stopPullDownRefresh()
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '办件加载失败'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  applyFilter(filter) {
    const all = this.data.all
    let list = all
    if (filter === 'processing') {
      list = all.filter(function (item) {
        return ['SUBMITTED', 'ACCEPTED', 'SUPPLEMENT', 'APPROVED', 'PAID'].indexOf(item.status) >= 0
      })
    } else if (filter === 'done') {
      list = all.filter(function (item) {
        return ['COMPLETED', 'REJECTED', 'CANCELED'].indexOf(item.status) >= 0
      })
    }
    this.setData({
      filter: filter,
      applies: list
    })
  },

  onFilterTap(e) {
    this.applyFilter(e.currentTarget.dataset.filter)
  },

  onItemTap(e) {
    wx.navigateTo({
      url: '/pages/gov/apply-detail?id=' + e.currentTarget.dataset.id
    })
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/gov/index' })
  },

  retry() {
    this.loadApplies()
  }
})
