const requestApi = require('../../api/request')

function statusClass(status) {
  if (status === 'COMPLETED' || status === 'RATED') return 'done'
  if (status === 'CLOSED') return 'muted'
  return 'processing'
}

Page({
  data: {
    all: [],
    list: [],
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
    this.loadRequests()
  },

  onShow() {
    if (this.loadedOnce) this.loadRequests()
  },

  onPullDownRefresh() {
    this.loadRequests(true)
  },

  loadRequests(isRefresh) {
    const self = this
    if (!this.loadedOnce) this.setData({ loading: true, error: '' })
    requestApi.list({}).then(function (res) {
      const all = (res.list || []).map(function (item) {
        return Object.assign({}, item, {
          statusClass: statusClass(item.status),
          dateText: String(item.createdAt || '').slice(0, 10)
        })
      })
      const processing = all.filter(function (item) {
        return ['PENDING', 'ACCEPTED', 'PROCESSING'].indexOf(item.status) >= 0
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
        error: err.message || '诉求加载失败'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  applyFilter(filter) {
    const all = this.data.all
    let list = all
    if (filter === 'processing') {
      list = all.filter(function (item) {
        return ['PENDING', 'ACCEPTED', 'PROCESSING'].indexOf(item.status) >= 0
      })
    } else if (filter === 'done') {
      list = all.filter(function (item) {
        return ['COMPLETED', 'CLOSED', 'RATED'].indexOf(item.status) >= 0
      })
    }
    this.setData({
      filter: filter,
      list: list
    })
  },

  onFilterTap(e) {
    this.applyFilter(e.currentTarget.dataset.filter)
  },

  onItemTap(e) {
    wx.navigateTo({
      url: '/pages/request/detail?id=' + e.currentTarget.dataset.id
    })
  },

  onCreate() {
    const self = this
    wx.showActionSheet({
      itemList: ['咨询帮办', '诉求建议', '意见建议'],
      success: function (res) {
        const types = ['consult', 'appeal', 'suggestion']
        const type = types[res.tapIndex] || 'appeal'
        self.goCreate(type)
      }
    })
  },

  goCreate(type) {
    wx.navigateTo({
      url: '/pages/request/create?type=' + type
    })
  },

  retry() {
    this.loadRequests()
  }
})
