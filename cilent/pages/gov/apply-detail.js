const govApi = require('../../api/gov')

const THEME = {
  SUBMITTED: 'orange',
  ACCEPTED: 'blue',
  SUPPLEMENT: 'red',
  APPROVED: 'green',
  PAID: 'green',
  COMPLETED: 'green',
  REJECTED: 'gray',
  CANCELED: 'gray'
}

Page({
  data: {
    id: '',
    apply: null,
    loading: true,
    error: '',
    formRows: [],
    ratingOpen: false,
    ratingScore: 5,
    ratingComment: '',
    submitting: false
  },

  onLoad(options) {
    const id = (options && options.id) || ''
    this.setData({ id: id })
    this.loadApply(id)
    if (options && options.created === '1') {
      wx.showToast({ title: '提交成功', icon: 'success' })
    }
  },

  onShow() {
    if (this.loadedOnce) this.loadApply(this.data.id)
  },

  loadApply(id) {
    const self = this
    if (!id) {
      this.setData({ loading: false, error: '缺少办件编号' })
      return
    }
    govApi.getApply(id).then(function (apply) {
      const formRows = Object.keys(apply.formData || {}).map(function (key) {
        return {
          label: key,
          value: apply.formData[key]
        }
      })
      const amount = Number(apply.amount || 0)
      self.setData({
        apply: Object.assign({}, apply, {
          statusTheme: THEME[apply.status] || 'gray',
          amountText: amount > 0 ? (amount / 100).toFixed(2).replace(/\.00$/, '') + ' 元' : '免费'
        }),
        formRows: formRows,
        loading: false,
        error: ''
      })
      self.loadedOnce = true
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '办件加载失败'
      })
    })
  },

  onCall() {
    const phone = (this.data.apply && this.data.apply.itemPhone) || '043264216888'
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/[^0-9]/g, '')
    })
  },

  onCancel() {
    const self = this
    wx.showModal({
      title: '撤销申请',
      content: '确定要撤销这条办件吗？撤销后需要重新提交。',
      confirmText: '撤销',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        govApi.cancelApply(self.data.id, '本人撤销').then(function () {
          wx.showToast({ title: '已撤销', icon: 'none' })
          self.loadApply(self.data.id)
        }).catch(function (err) {
          wx.showToast({ title: err.message || '撤销失败', icon: 'none' })
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
    this.setData({
      ratingScore: Number(e.currentTarget.dataset.score)
    })
  },

  onCommentInput(e) {
    this.setData({ ratingComment: e.detail.value })
  },

  submitRating() {
    const self = this
    if (this.data.submitting) return
    this.setData({ submitting: true })
    govApi.rateApply(this.data.id, this.data.ratingScore, this.data.ratingComment).then(function () {
      self.setData({
        submitting: false,
        ratingOpen: false
      })
      wx.showToast({ title: '评价成功', icon: 'none' })
      self.loadApply(self.data.id)
    }).catch(function (err) {
      self.setData({ submitting: false })
      wx.showToast({ title: err.message || '评价失败', icon: 'none' })
    })
  },

  onGuide() {
    if (!this.data.apply) return
    wx.navigateTo({
      url: '/pages/gov/detail?code=' + this.data.apply.itemCode
    })
  },

  onAgain() {
    wx.navigateTo({ url: '/pages/gov/index' })
  },

  retry() {
    this.loadApply(this.data.id)
  },

  noop() {},

  onShareAppMessage() {
    const apply = this.data.apply
    return {
      title: apply ? '我的办件：' + apply.itemShortName : '我的办件',
      path: '/pages/gov/applies'
    }
  }
})
