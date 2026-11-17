const requestApi = require('../../api/request')

const THEME = {
  PENDING: 'orange',
  ACCEPTED: 'blue',
  PROCESSING: 'blue',
  COMPLETED: 'green',
  RATED: 'green',
  CLOSED: 'gray'
}

Page({
  data: {
    id: '',
    request: null,
    loading: true,
    error: '',
    ratingOpen: false,
    ratingScore: 5,
    ratingComment: '',
    submitting: false
  },

  onLoad(options) {
    const id = (options && options.id) || ''
    this.setData({ id: id })
    this.loadRequest(id)
    if (options && options.created === '1') {
      wx.showToast({ title: '提交成功', icon: 'success' })
    }
  },

  onShow() {
    if (this.loadedOnce) this.loadRequest(this.data.id)
  },

  loadRequest(id) {
    const self = this
    if (!id) {
      this.setData({ loading: false, error: '缺少诉求编号' })
      return
    }
    requestApi.detail(id).then(function (request) {
      const replies = (request.replies || []).map(function (reply) {
        return Object.assign({}, reply, {
          avatarText: String(reply.operator || '村').charAt(0)
        })
      })
      self.setData({
        request: Object.assign({}, request, {
          replies: replies,
          statusTheme: THEME[request.status] || 'gray'
        }),
        loading: false,
        error: ''
      })
      self.loadedOnce = true
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '诉求加载失败'
      })
    })
  },

  onCall() {
    wx.makePhoneCall({ phoneNumber: '043264216888' })
  },

  onPreviewPhoto(e) {
    const index = Number(e.currentTarget.dataset.index)
    const photos = this.data.request.photos || []
    if (!photos.length) return
    wx.previewImage({
      current: photos[index],
      urls: photos
    })
  },

  onUrge() {
    const self = this
    wx.showModal({
      title: '催办提醒',
      content: '将提醒网格员尽快处理，确定发送吗？',
      confirmText: '催办',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        requestApi.urge(self.data.id).then(function (result) {
          wx.showToast({ title: result.message || '已提醒', icon: 'none' })
          self.loadRequest(self.data.id)
        }).catch(function (err) {
          wx.showToast({ title: err.message || '催办失败', icon: 'none' })
        })
      }
    })
  },

  openRating() {
    this.setData({
      ratingOpen: true,
      ratingScore: 5,
      ratingComment: ''
    })
  },

  closeRating() {
    if (this.data.submitting) return
    this.setData({ ratingOpen: false })
  },

  onStar(e) {
    this.setData({ ratingScore: Number(e.currentTarget.dataset.score) })
  },

  onCommentInput(e) {
    this.setData({ ratingComment: e.detail.value })
  },

  submitRating() {
    const self = this
    if (this.data.submitting) return
    this.setData({ submitting: true })
    requestApi.rate(this.data.id, this.data.ratingScore, this.data.ratingComment).then(function () {
      self.setData({ submitting: false, ratingOpen: false })
      wx.showToast({ title: '评价成功', icon: 'none' })
      self.loadRequest(self.data.id)
    }).catch(function (err) {
      self.setData({ submitting: false })
      wx.showToast({ title: err.message || '评价失败', icon: 'none' })
    })
  },

  onAgain() {
    wx.navigateTo({ url: '/pages/request/appeal/index' })
  },

  retry() {
    this.loadRequest(this.data.id)
  },

  noop() {},

  onShareAppMessage() {
    const request = this.data.request
    return {
      title: request ? request.title : '我的诉求',
      path: '/pages/request/list'
    }
  }
})
