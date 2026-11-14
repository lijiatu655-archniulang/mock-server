const govApi = require('../../api/gov')
const upload = require('../../utils/upload')
const config = require('../../utils/config')

Page({
  data: {
    code: '',
    item: null,
    loading: true,
    error: '',
    fields: [],
    materials: [],
    agree: false,
    formError: '',
    submitting: false
  },

  onLoad(options) {
    const code = (options && options.code) || ''
    this.setData({ code: code })
    this.loadItem(code)
  },

  loadItem(code) {
    const self = this
    if (!code) {
      this.setData({ loading: false, error: '缺少事项编号' })
      return
    }
    this.setData({ loading: true, error: '' })
    govApi.getItem(code).then(function (item) {
      const fields = (item.formFields || []).map(function (field, index) {
        return Object.assign({}, field, {
          key: 'f' + index,
          value: ''
        })
      })
      const materials = (item.materials || []).map(function (material, index) {
        return Object.assign({}, material, {
          index: index,
          filePath: '',
          uploaded: false
        })
      })
      self.setData({
        item: item,
        fields: fields,
        materials: materials,
        loading: false
      })
      wx.setNavigationBarTitle({ title: item.shortName || '在线申报' })
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '事项加载失败'
      })
    })
  },

  onFieldInput(e) {
    const index = Number(e.currentTarget.dataset.index)
    const key = 'fields[' + index + '].value'
    const payload = {}
    payload[key] = e.detail.value
    this.setData(payload)
  },

  onSelectChange(e) {
    const index = Number(e.currentTarget.dataset.index)
    const field = this.data.fields[index]
    const value = field.options[Number(e.detail.value)]
    const payload = {}
    payload['fields[' + index + '].value'] = value
    this.setData(payload)
  },

  onDateChange(e) {
    const index = Number(e.currentTarget.dataset.index)
    const payload = {}
    payload['fields[' + index + '].value'] = e.detail.value
    this.setData(payload)
  },

  onRadioTap(e) {
    const index = Number(e.currentTarget.dataset.index)
    const option = e.currentTarget.dataset.option
    const payload = {}
    payload['fields[' + index + '].value'] = option
    this.setData(payload)
  },

  onMaterialTap(e) {
    const index = Number(e.currentTarget.dataset.index)
    const self = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function (res) {
        const file = res.tempFiles && res.tempFiles[0]
        if (!file) return
        const payload = {}
        payload['materials[' + index + '].filePath'] = file.tempFilePath
        payload['materials[' + index + '].uploaded'] = true
        self.setData(payload)
        wx.showToast({ title: '已选择材料', icon: 'none' })
      }
    })
  },

  onAgreeTap() {
    this.setData({ agree: !this.data.agree })
  },

  validateFields() {
    const missing = this.data.fields.filter(function (field) {
      return field.required && !String(field.value || '').trim()
    }).map(function (field) {
      return field.label
    })
    const missingMaterials = this.data.materials.filter(function (material) {
      return material.required && !material.uploaded
    }).map(function (material) {
      return material.name
    })
    return {
      missing: missing,
      missingMaterials: missingMaterials
    }
  },

  onSubmit() {
    if (this.data.submitting) return
    const result = this.validateFields()
    if (result.missing.length) {
      const message = '请填写：' + result.missing.join('、')
      this.setData({ formError: message })
      wx.showToast({ title: message, icon: 'none' })
      return
    }
    if (!this.data.agree) {
      wx.showToast({ title: '请先勾选承诺', icon: 'none' })
      return
    }
    if (result.missingMaterials.length) {
      const self = this
      wx.showModal({
        title: '还有材料没上传',
        content: '缺少：' + result.missingMaterials.join('、') + '。\n可以先提交，受理时会通知您补正；也可以现在补齐再提交。',
        confirmText: '先提交',
        cancelText: '去补齐',
        confirmColor: '#C4161C',
        success: function (res) {
          if (res.confirm) self.submit()
        }
      })
      return
    }
    this.submit()
  },

  submit() {
    const self = this
    const formData = {}
    this.data.fields.forEach(function (field) {
      formData[field.label] = field.value
    })
    const selected = this.data.materials.filter(function (material) {
      return material.uploaded && material.filePath
    })
    this.setData({ submitting: true, formError: '' })
    wx.showLoading({ title: '正在提交', mask: true })

    let uploadTask = Promise.resolve([])
    if (selected.length && !config.USE_MOCK) {
      uploadTask = Promise.all(selected.map(function (material) {
        return upload.uploadFile(material.filePath, 'apply_material', material.name)
      }))
    }

    uploadTask.then(function (files) {
      return govApi.createApply({
        itemCode: self.data.code,
        formData: formData,
        materialNames: selected.map(function (material) {
          return material.name
        }),
        fileIds: (files || []).map(function (file) {
          return file.id
        }).filter(Boolean)
      })
    }).then(function (apply) {
      wx.hideLoading()
      self.setData({ submitting: false })
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/gov/apply-detail?id=' + apply.id + '&created=1'
        })
      }, 700)
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({
        submitting: false,
        formError: err.message || '提交失败，请重试'
      })
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    })
  },

  retry() {
    this.loadItem(this.data.code)
  }
})
