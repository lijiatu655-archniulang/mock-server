const app = getApp()
const familyApi = require('../../api/family')

const RELATIONS = ['父亲', '母亲', '配偶', '子女', '其他']
const GENDERS = ['男', '女']

Page({
  data: {
    list: [],
    loading: true,
    error: '',
    formOpen: false,
    saving: false,
    relations: RELATIONS,
    genders: GENDERS,
    relationIndex: 0,
    genderIndex: 0,
    form: {
      id: '',
      name: '',
      relation: '父亲',
      gender: '男',
      age: '',
      phone: '',
      idCardMasked: '',
      isGuardian: 0
    }
  },

  onLoad() {
    if (!app.globalData.user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.switchTab({ url: '/pages/profile/profile' })
      return
    }
    this.load()
  },

  onShow() {
    if (app.globalData.user && !this.data.formOpen) this.load()
  },

  load() {
    const self = this
    this.setData({ loading: true, error: '' })
    familyApi.list().then(function (list) {
      const decorated = (list || []).map(function (item) {
        return Object.assign({}, item, {
          initial: String(item.name || '家').charAt(0)
        })
      })
      self.setData({ list: decorated, loading: false })
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: (err && err.message) || '家庭成员加载失败'
      })
    })
  },

  onBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  openAdd() {
    this.setData({
      formOpen: true,
      saving: false,
      relationIndex: 0,
      genderIndex: 0,
      form: {
        id: '',
        name: '',
        relation: RELATIONS[0],
        gender: GENDERS[0],
        age: '',
        phone: '',
        idCardMasked: '',
        isGuardian: 0
      }
    })
  },

  openEdit(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.filter(function (m) {
      return m.id === id
    })[0]
    if (!item) return
    const relationIndex = Math.max(0, RELATIONS.indexOf(item.relation))
    const genderIndex = Math.max(0, GENDERS.indexOf(item.gender))
    this.setData({
      formOpen: true,
      saving: false,
      relationIndex: relationIndex,
      genderIndex: genderIndex,
      form: {
        id: item.id,
        name: item.name || '',
        relation: item.relation || RELATIONS[relationIndex],
        gender: item.gender || GENDERS[genderIndex],
        age: item.age === null || item.age === undefined ? '' : String(item.age),
        phone: item.phone || '',
        idCardMasked: item.idCardMasked || '',
        isGuardian: item.isGuardian ? 1 : 0
      }
    })
  },

  closeForm() {
    if (this.data.saving) return
    this.setData({ formOpen: false })
  },

  onField(e) {
    const field = e.currentTarget.dataset.field
    if (!field) return
    const patch = {}
    patch['form.' + field] = e.detail.value || ''
    this.setData(patch)
  },

  onRelationChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      relationIndex: index,
      'form.relation': RELATIONS[index]
    })
  },

  onGenderChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      genderIndex: index,
      'form.gender': GENDERS[index]
    })
  },

  onGuardianChange(e) {
    this.setData({ 'form.isGuardian': e.detail.value ? 1 : 0 })
  },

  save() {
    const self = this
    if (this.data.saving) return
    const form = this.data.form
    const name = String(form.name || '').trim()
    if (!name) {
      wx.showToast({ title: '请填写成员姓名', icon: 'none' })
      return
    }
    const ageText = String(form.age || '').trim()
    if (ageText && (!/^\d+$/.test(ageText) || Number(ageText) > 120)) {
      wx.showToast({ title: '年龄请填 0—120 的数字', icon: 'none' })
      return
    }
    const payload = {
      name: name,
      relation: form.relation,
      gender: form.gender,
      age: ageText ? Number(ageText) : null,
      phone: String(form.phone || '').trim(),
      idCardMasked: String(form.idCardMasked || '').trim(),
      isGuardian: form.isGuardian ? 1 : 0
    }
    this.setData({ saving: true })
    const task = form.id
      ? familyApi.update(form.id, payload)
      : familyApi.create(payload)
    task.then(function () {
      self.setData({ saving: false, formOpen: false })
      wx.showToast({ title: form.id ? '已保存' : '已添加', icon: 'success' })
      self.load()
    }).catch(function (err) {
      self.setData({ saving: false })
      wx.showToast({ title: err.message || '保存失败', icon: 'none' })
    })
  },

  remove(e) {
    const self = this
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.showModal({
      title: '删除家庭成员',
      content: '删除后不可恢复，确定继续吗？',
      confirmText: '删除',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        familyApi.remove(id).then(function () {
          wx.showToast({ title: '已删除', icon: 'none' })
          self.load()
        }).catch(function (err) {
          wx.showToast({ title: err.message || '删除失败', icon: 'none' })
        })
      }
    })
  },

  noop() {}
})
