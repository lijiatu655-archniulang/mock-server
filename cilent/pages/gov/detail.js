const govApi = require('../../api/gov')
const systemApi = require('../../api/system')

const TYPE_LABEL = {
  text: '文本输入',
  idcard: '身份证号',
  select: '下拉选择',
  radio: '单选',
  date: '日期选择'
}

Page({
  data: {
    code: '',
    item: null,
    loading: true,
    error: '',
    faqOpen: -1
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
      const formFields = (item.formFields || []).map(function (field) {
        return Object.assign({}, field, {
          typeLabel: TYPE_LABEL[field.type] || '文本输入'
        })
      })
      const fee = String(item.fee || '')
      let feeShort = fee
      if (fee.indexOf('免费') >= 0) feeShort = '免费'
      else if (fee.indexOf('380') >= 0) feeShort = '380 元/年'
      else if (fee.indexOf('200') >= 0) feeShort = '按档次'
      self.setData({
        item: Object.assign({}, item, {
          formFields: formFields,
          feeShort: feeShort,
          requiredCount: (item.materials || []).filter(function (m) {
            return m.required
          }).length
        }),
        loading: false
      })
      wx.setNavigationBarTitle({ title: item.shortName || '事项详情' })
      systemApi.reportEvent('gov_item_view', {
        code: code
      })
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '事项加载失败'
      })
    })
  },

  onCall() {
    const phone = (this.data.item && this.data.item.phone) || '09995021688'
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/[^0-9]/g, '')
    })
  },

  onApply() {
    wx.navigateTo({
      url: '/pages/gov/apply?code=' + this.data.code
    })
  },

  toggleFaq(e) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({
      faqOpen: this.data.faqOpen === index ? -1 : index
    })
  },

  retry() {
    this.loadItem(this.data.code)
  },

  onShareAppMessage() {
    const item = this.data.item
    return {
      title: item ? item.name + ' · 办事指南' : '新源村政务服务',
      path: '/pages/gov/detail?code=' + this.data.code
    }
  }
})
