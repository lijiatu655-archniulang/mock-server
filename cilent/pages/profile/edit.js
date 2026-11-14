const app = getApp()
const userApi = require('../../api/user')
const upload = require('../../utils/upload')

Page({
  data: {
    user: {
      avatarText: '王',
      name: '',
      nickname: '',
      regionPath: []
    },
    nickname: '',
    avatarUrl: '',
    avatarPreview: '',
    avatarChanged: false,
    avatarFailed: false,
    dirty: false,
    regionText: '',
    saving: false,
    error: ''
  },

  onLoad() {
    const self = this
    app.ensureLogin().then(function () {
      return userApi.me()
    }).then(function (user) {
      self.fillUser(user)
    }).catch(function () {
      const user = app.globalData.user
      if (user) {
        self.fillUser(user)
      } else {
        self.setData({ error: '请先登录' })
      }
    })
  },

  fillUser(user) {
    this.setData({
      user: user,
      nickname: user.nickname || user.name || '',
      avatarUrl: user.avatarUrl || '',
      avatarPreview: user.avatarUrl || '',
      avatarFailed: false,
      dirty: false,
      regionText: (user.regionPath || []).join(' / '),
      error: ''
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (!avatarUrl) return
    this.setData({
      avatarPreview: avatarUrl,
      avatarChanged: true,
      avatarFailed: false,
      dirty: true
    })
  },

  onChooseFromAlbum() {
    const self = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function (res) {
        const file = res.tempFiles && res.tempFiles[0]
        if (!file) return
        self.setData({
          avatarPreview: file.tempFilePath,
          avatarChanged: true,
          avatarFailed: false,
          dirty: true
        })
      }
    })
  },

  onRestoreAvatar() {
    this.setData({
      avatarPreview: '',
      avatarChanged: true,
      avatarFailed: false,
      dirty: true
    })
  },

  onAvatarError() {
    this.setData({ avatarFailed: true })
  },

  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value,
      dirty: true,
      error: ''
    })
  },

  onSave() {
    const self = this
    if (this.data.saving) return
    if (!this.data.dirty) {
      wx.showToast({ title: '还没有修改', icon: 'none' })
      return
    }
    const nickname = String(this.data.nickname || '').trim()
    if (nickname.length < 2 || nickname.length > 12) {
      this.setData({ error: '昵称需要 2—12 个字' })
      return
    }
    this.setData({ saving: true, error: '' })
    wx.showLoading({ title: '保存中', mask: true })

    let avatarTask = Promise.resolve(this.data.avatarUrl)
    if (this.data.avatarChanged) {
      avatarTask = this.data.avatarPreview
        ? upload.uploadFile(this.data.avatarPreview, 'avatar', 'avatar.jpg').then(function (file) {
          return file.url
        })
        : Promise.resolve('')
    }

    avatarTask.then(function (avatarUrl) {
      return userApi.updateMe({
        nickname: nickname,
        avatarUrl: avatarUrl
      })
    }).then(function (user) {
      const merged = Object.assign({}, app.globalData.user || {}, user, {
        nickname: nickname,
        avatarUrl: user.avatarUrl || self.data.avatarPreview
      })
      app.setUser(merged)
      wx.hideLoading()
      self.setData({ saving: false, dirty: false })
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(function () {
        wx.navigateBack()
      }, 600)
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({
        saving: false,
        error: err.message || '保存失败'
      })
      wx.showToast({ title: err.message || '保存失败', icon: 'none' })
    })
  }
})
