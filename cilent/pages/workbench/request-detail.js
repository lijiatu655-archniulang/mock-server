const workbenchApi = require('../../api/workbench')

function parsePhotos(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function normalize(item) {
  if (!item) return null
  return Object.assign({}, item, {
    photos: parsePhotos(item.photos),
    logs: item.logs || [],
    replies: item.replies || []
  })
}

Page({
  data: {
    id: '',
    request: null,
    loading: true,
    error: '',
    replyOpen: false,
    replyContent: '',
    replyImages: [],
    actionLoading: false
  },

  onLoad(query) {
    const id = query && query.id
    if (!id) {
      this.setData({ loading: false, error: '缺少诉求编号' })
      return
    }
    this.setData({ id: id })
    this.load()
  },

  load() {
    const self = this
    this.setData({ loading: true, error: '' })
    workbenchApi.getRequestDetail(this.data.id).then(function (res) {
      self.setData({
        request: normalize(res),
        loading: false
      })
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: (err && err.message) || '诉求加载失败'
      })
    })
  },

  onRefresh() {
    this.load()
  },

  onBack() {
    wx.navigateBack()
  },

  onPreviewPhoto(e) {
    const src = e.currentTarget.dataset.src
    if (!src) return
    wx.previewImage({ current: src, urls: this.data.request.photos })
  },

  onAccept() {
    const self = this
    if (this.data.actionLoading) return
    wx.showModal({
      title: '受理诉求',
      content: '受理后将写入办理时间轴，并进入处理中。',
      confirmText: '受理',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        self.setData({ actionLoading: true })
        workbenchApi.acceptRequest(self.data.id).then(function (data) {
          self.setData({
            actionLoading: false,
            request: normalize(data)
          })
          wx.showToast({ title: '已受理', icon: 'success' })
        }).catch(function (err) {
          self.setData({ actionLoading: false })
          wx.showToast({ title: err.message || '操作失败', icon: 'none' })
        })
      }
    })
  },

  onReplyOpen() {
    this.setData({
      replyOpen: true,
      replyContent: '',
      replyImages: []
    })
  },

  onReplyClose() {
    if (this.data.actionLoading) return
    this.setData({ replyOpen: false })
  },

  onReplyInput(e) {
    this.setData({ replyContent: e.detail.value || '' })
  },

  chooseReplyImages() {
    const self = this
    const remain = 3 - this.data.replyImages.length
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
          replyImages: self.data.replyImages.concat(paths).slice(0, 3)
        })
      }
    })
  },

  removeReplyImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.replyImages.slice()
    list.splice(index, 1)
    this.setData({ replyImages: list })
  },

  previewReplyImage(e) {
    const src = e.currentTarget.dataset.src
    if (!src) return
    wx.previewImage({ current: src, urls: this.data.replyImages })
  },

  onReplySubmit() {
    const self = this
    if (this.data.actionLoading) return
    const content = String(this.data.replyContent || '').trim()
    if (!content) {
      wx.showToast({ title: '请填写回复内容', icon: 'none' })
      return
    }
    this.setData({ actionLoading: true })
    workbenchApi.replyRequest(this.data.id, content).then(function (data) {
      self.setData({
        actionLoading: false,
        replyOpen: false,
        replyContent: '',
        replyImages: [],
        request: normalize(data)
      })
      wx.showToast({ title: '回复成功', icon: 'success' })
    }).catch(function (err) {
      self.setData({ actionLoading: false })
      wx.showToast({ title: err.message || '回复失败', icon: 'none' })
    })
  },

  onComplete() {
    const self = this
    if (this.data.actionLoading) return
    wx.showModal({
      title: '办结诉求',
      content: '办结后居民端状态将变为「已办结」，请确认已回复。',
      confirmText: '办结',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        self.setData({ actionLoading: true })
        workbenchApi.completeRequest(self.data.id).then(function (data) {
          self.setData({
            actionLoading: false,
            request: normalize(data)
          })
          wx.showToast({ title: '已办结', icon: 'success' })
        }).catch(function (err) {
          self.setData({ actionLoading: false })
          wx.showToast({ title: err.message || '操作失败', icon: 'none' })
        })
      }
    })
  },

  noop() {}
})
