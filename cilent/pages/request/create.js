const requestApi = require('../../api/request')
const upload = require('../../utils/upload')
const config = require('../../utils/config')

const TYPES = [{
  value: 'consult',
  name: '咨询帮办',
  desc: '政策不懂、办事不会，问一句'
}, {
  value: 'appeal',
  name: '诉求建议',
  desc: '路灯、垃圾、邻里事，件件有回音'
}, {
  value: 'suggestion',
  name: '意见建议',
  desc: '对村里工作有想法，欢迎提'
}]

Page({
  data: {
    types: TYPES,
    type: 'appeal',
    typeName: '诉求建议',
    typeDesc: '路灯、垃圾、邻里事，件件有回音',
    title: '',
    content: '',
    location: '',
    contactPhone: '',
    photos: [],
    submitting: false,
    error: ''
  },

  onLoad(options) {
    const type = (options && options.type) || 'appeal'
    const current = TYPES.filter(function (item) {
      return item.value === type
    })[0] || TYPES[1]
    this.setData({
      type: current.value,
      typeName: current.name,
      typeDesc: current.desc
    })
    wx.setNavigationBarTitle({ title: current.name })
  },

  onTypeTap(e) {
    const type = e.currentTarget.dataset.type
    const current = TYPES.filter(function (item) {
      return item.value === type
    })[0]
    if (!current) return
    this.setData({
      type: current.value,
      typeName: current.name,
      typeDesc: current.desc
    })
    wx.setNavigationBarTitle({ title: current.name })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const payload = {}
    payload[field] = e.detail.value
    this.setData(payload)
    if (this.data.error) this.setData({ error: '' })
  },

  onChoosePhoto() {
    const self = this
    if (this.data.photos.length >= 3) {
      wx.showToast({ title: '最多上传 3 张', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: 3 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function (res) {
        const files = (res.tempFiles || []).map(function (file) {
          return file.tempFilePath
        })
        self.setData({
          photos: self.data.photos.concat(files).slice(0, 3)
        })
      }
    })
  },

  onRemovePhoto(e) {
    const index = Number(e.currentTarget.dataset.index)
    const photos = this.data.photos.slice()
    photos.splice(index, 1)
    this.setData({ photos: photos })
  },

  onSubmit() {
    if (this.data.submitting) return
    const title = this.data.title.trim()
    const content = this.data.content.trim()
    if (title.length < 4) {
      this.showError('标题至少写 4 个字，方便我们快速识别')
      return
    }
    if (content.length < 10) {
      this.showError('请把具体情况写清楚，至少 10 个字')
      return
    }
    this.setData({ submitting: true, error: '' })
    wx.showLoading({ title: '正在提交', mask: true })

    const self = this
    let uploadTask = Promise.resolve([])
    if (this.data.photos.length && !config.USE_MOCK) {
      uploadTask = Promise.all(this.data.photos.map(function (path, index) {
        return upload.uploadFile(path, 'request_photo', 'photo_' + index)
      }))
    }

    uploadTask.then(function (files) {
      const photoUrls = (files && files.length)
        ? files.map(function (file) { return file.url })
        : self.data.photos
      return requestApi.create({
        type: self.data.type,
        title: title,
        content: content,
        location: self.data.location.trim(),
        contactPhone: self.data.contactPhone.trim(),
        photos: photoUrls
      })
    }).then(function (request) {
      wx.hideLoading()
      self.setData({ submitting: false })
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/request/detail?id=' + request.id + '&created=1'
        })
      }, 700)
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({
        submitting: false,
        error: err.message || '提交失败，请重试'
      })
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    })
  },

  showError(message) {
    this.setData({ error: message })
    wx.showToast({ title: message, icon: 'none' })
  }
})
