const app = getApp()
const workbenchApi = require('../../api/workbench')

const REQUEST_FILTERS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待受理' },
  { value: 'ACCEPTED', label: '已受理' },
  { value: 'PROCESSING', label: '处理中' },
  { value: 'COMPLETED', label: '已办结' }
]

Page({
  data: {
    user: null,
    tab: 'overview',
    loading: true,
    error: '',
    summary: {
      pendingRequests: 0,
      todayRequests: 0,
      households: 0,
      population: 0,
      notices: 0
    },
    notices: [],
    noticeOpen: false,
    noticeForm: {
      id: '',
      text: '',
      type: 'normal'
    },
    noticeImages: [],
    noticeSaving: false,
    requestFilters: REQUEST_FILTERS,
    requestStatus: '',
    requests: [],
    requestTotal: 0,
    requestLoading: false,
    stats: null
  },

  onLoad() {
    const user = app.globalData.user
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.switchTab({ url: '/pages/profile/profile' })
      return
    }
    if (user.roleCode !== 'admin') {
      wx.showToast({ title: '仅管理员可进入工作台', icon: 'none' })
      wx.switchTab({ url: '/pages/profile/profile' })
      return
    }
    this.setData({
      user: user,
      loading: true
    })
    this.loadAll()
  },

  onShow() {
    if (this.loadedOnce) this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll().then(function () {
      wx.stopPullDownRefresh()
    }).catch(function () {
      wx.stopPullDownRefresh()
    })
  },

  loadAll() {
    const self = this
    this.setData({ error: '' })
    return Promise.all([
      this.loadSummary(),
      this.loadNotices(),
      this.loadRequests(),
      this.loadStats()
    ]).then(function () {
      self.setData({ loading: false })
      self.loadedOnce = true
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: (err && err.message) || '工作台加载失败'
      })
    })
  },

  loadSummary() {
    const self = this
    return workbenchApi.summary().then(function (res) {
      self.setData({ summary: res || self.data.summary })
    })
  },

  loadNotices() {
    const self = this
    return workbenchApi.getNotices().then(function (list) {
      self.setData({ notices: list || [] })
    })
  },

  loadRequests() {
    const self = this
    this.setData({ requestLoading: true })
    return workbenchApi.getRequests({
      status: this.data.requestStatus || undefined,
      page: 1,
      pageSize: 50
    }).then(function (res) {
      self.setData({
        requests: (res && res.list) || [],
        requestTotal: (res && res.total) || 0,
        requestLoading: false
      })
    }).catch(function (err) {
      self.setData({ requestLoading: false })
      throw err
    })
  },

  loadStats() {
    const self = this
    return workbenchApi.getHouseholdStatistics('22022110001').then(function (res) {
      const total = (res && res.population) || 1
      const grids = ((res && res.grids) || []).map(function (g) {
        return Object.assign({}, g, {
          percent: Math.min(100, Math.round(((g.population || 0) / total) * 100))
        })
      })
      self.setData({ stats: Object.assign({}, res || {}, { grids: grids }) })
    })
  },

  onTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (!tab || tab === this.data.tab) return
    this.setData({ tab: tab })
    if (tab === 'notices') this.loadNotices()
    if (tab === 'requests') this.loadRequests()
    if (tab === 'stats') this.loadStats()
  },

  onRefresh() {
    this.loadAll().then(function () {
      wx.showToast({ title: '已刷新', icon: 'none' })
    })
  },

  onBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  /* ---------- 通知 ---------- */
  openNotice(e) {
    const id = e.currentTarget.dataset.id
    if (!id) {
      this.setData({
        noticeOpen: true,
        noticeImages: [],
        noticeForm: { id: '', text: '', type: 'normal' }
      })
      return
    }
    const notice = this.data.notices.filter(function (n) {
      return n.id === id
    })[0]
    if (!notice) return
    this.setData({
      noticeOpen: true,
      noticeImages: [],
      noticeForm: {
        id: notice.id,
        text: notice.text || '',
        type: notice.type === 'urgent' ? 'urgent' : 'normal'
      }
    })
  },

  closeNotice() {
    if (this.data.noticeSaving) return
    this.setData({ noticeOpen: false })
  },

  onNoticeText(e) {
    this.setData({ 'noticeForm.text': e.detail.value || '' })
  },

  setNoticeType(e) {
    const type = e.currentTarget.dataset.type === 'urgent' ? 'urgent' : 'normal'
    this.setData({ 'noticeForm.type': type })
  },

  chooseNoticeImages() {
    const self = this
    const remain = 3 - this.data.noticeImages.length
    if (remain <= 0) return
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function (res) {
        const paths = (res.tempFiles || []).map(function (f) {
          return f.tempFilePath
        })
        self.setData({
          noticeImages: self.data.noticeImages.concat(paths).slice(0, 3)
        })
      }
    })
  },

  removeNoticeImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.noticeImages.slice()
    list.splice(index, 1)
    this.setData({ noticeImages: list })
  },

  previewNoticeImage(e) {
    const src = e.currentTarget.dataset.src
    if (!src) return
    wx.previewImage({ current: src, urls: this.data.noticeImages })
  },

  saveNotice() {
    const self = this
    if (this.data.noticeSaving) return
    const form = this.data.noticeForm
    const text = String(form.text || '').trim()
    if (!text) {
      wx.showToast({ title: '请填写通知内容', icon: 'none' })
      return
    }
    this.setData({ noticeSaving: true })
    const task = form.id
      ? workbenchApi.updateNotice(form.id, { text: text, type: form.type })
      : workbenchApi.createNotice({ text: text, type: form.type })
    task.then(function () {
      self.setData({ noticeSaving: false, noticeOpen: false })
      wx.showToast({ title: form.id ? '通知已更新' : '通知已发布', icon: 'success' })
      self.loadNotices()
      self.loadSummary()
    }).catch(function (err) {
      self.setData({ noticeSaving: false })
      wx.showToast({ title: err.message || '保存失败', icon: 'none' })
    })
  },

  deleteNotice(e) {
    const self = this
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.showModal({
      title: '下架通知',
      content: '下架后居民首页将不再展示这条通知。',
      confirmText: '下架',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        workbenchApi.deleteNotice(id).then(function () {
          wx.showToast({ title: '已下架', icon: 'none' })
          self.loadNotices()
          self.loadSummary()
        }).catch(function (err) {
          wx.showToast({ title: err.message || '操作失败', icon: 'none' })
        })
      }
    })
  },

  /* ---------- 诉求 ---------- */
  setRequestStatus(e) {
    const status = e.currentTarget.dataset.status || ''
    if (status === this.data.requestStatus) return
    this.setData({ requestStatus: status })
    this.loadRequests().catch(function (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' })
    })
  },

  openRequest(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: '/pages/workbench/request-detail?id=' + id })
  },

  goNotices() {
    this.setData({ tab: 'notices' })
  },

  goRequests() {
    this.setData({ tab: 'requests' })
  },

  goStats() {
    this.setData({ tab: 'stats' })
  },

  noop() {}
})
