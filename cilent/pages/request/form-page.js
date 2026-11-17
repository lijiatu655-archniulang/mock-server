const requestApi = require('../../api/request')
const upload = require('../../utils/upload')
const config = require('../../utils/config')
const i18n = require('../../utils/i18n')

const TYPES = {
  consult: {
    type: 'consult',
    name: '咨询帮办',
    nameKo: '상담·대행',
    desc: '政策不懂、办事不会，问一句',
    descKo: '정책을 모르거나 일 처리가 어려우면 물어보세요',
    icon: '💬',
    headTitle: '咨询帮办',
    headTitleKo: '상담·대행',
    headSub: '政策不懂、办事不会，问一句，网格员帮您问清楚。',
    headSubKo: '정책을 모르거나 일 처리가 어려우면 물어보세요. 그리드 담당자가 도와드립니다.',
    contentPlaceholder: '把想问的政策、想办的事写清楚',
    contentPlaceholderKo: '궁금한 정책이나 도움이 필요한 일을 적어주세요',
    submitText: '提交咨询',
    submitTextKo: '상담 신청'
  },
  appeal: {
    type: 'appeal',
    name: '诉求建议',
    nameKo: '요구·건의',
    desc: '路灯、垃圾、邻里事，件件有回音',
    descKo: '가로등·쓰레기·이웃 문제, 건마다 답변',
    icon: '📣',
    headTitle: '有事您说话',
    headTitleKo: '말씀하세요',
    headSub: '村里的事，件件有回音；紧急情况请直接拨打 110 / 120。',
    headSubKo: '마을 일은 건마다 답변드립니다. 긴급 상황은 110 / 120에 직접 연락하세요.',
    contentPlaceholder: '时间、地点、经过，写得越清楚，处理越快',
    contentPlaceholderKo: '언제, 어디서, 무슨 일이 있었는지 자세히 적어주세요',
    submitText: '提交诉求',
    submitTextKo: '요구 제출'
  },
  suggestion: {
    type: 'suggestion',
    name: '意见建议',
    nameKo: '의견·건의',
    desc: '对村里工作有想法，欢迎提',
    descKo: '마을 운영에 대한 의견을 환영합니다',
    icon: '💡',
    headTitle: '说说您的想法',
    headTitleKo: '의견을 들려주세요',
    headSub: '对村里工作有想法、有建议，欢迎提。',
    headSubKo: '마을 운영에 대한 의견과 건의를 환영합니다.',
    contentPlaceholder: '您的想法、建议，越具体越好',
    contentPlaceholderKo: '생각과 건의를 구체적으로 적어주세요',
    submitText: '提交建议',
    submitTextKo: '건의 제출'
  }
}

function createRequestPage(key) {
  const meta = TYPES[key] || TYPES.appeal

  return {
    data: {
      type: meta.type,
      typeName: meta.name,
      typeNameKo: meta.nameKo,
      typeDesc: meta.desc,
      typeDescKo: meta.descKo,
      typeIcon: meta.icon,
      headTitle: meta.headTitle,
      headTitleKo: meta.headTitleKo,
      headSub: meta.headSub,
      headSubKo: meta.headSubKo,
      contentPlaceholder: meta.contentPlaceholder,
      contentPlaceholderKo: meta.contentPlaceholderKo,
      submitText: meta.submitText,
      submitTextKo: meta.submitTextKo,
      title: '',
      content: '',
      location: '',
      contactPhone: '',
      photos: [],
      submitting: false,
      error: ''
    },

    onLoad() {
      this.syncTitle()
    },

    onShow() {
      this.syncTitle()
    },

    syncTitle() {
      if (!wx.setNavigationBarTitle) return
      const ko = i18n.getLang() === 'ko'
      wx.setNavigationBarTitle({ title: ko ? meta.nameKo : meta.name })
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
        wx.showToast({
          title: i18n.getLang() === 'ko' ? '최대 3장까지 가능합니다' : '最多上传 3 张',
          icon: 'none'
        })
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
      const ko = i18n.getLang() === 'ko'
      const title = this.data.title.trim()
      const content = this.data.content.trim()
      if (title.length < 4) {
        this.showError(ko ? '제목을 4자 이상 입력해 주세요' : '标题至少写 4 个字，方便我们快速识别')
        return
      }
      if (content.length < 10) {
        this.showError(ko ? '상황을 10자 이상 자세히 적어주세요' : '请把具体情况写清楚，至少 10 个字')
        return
      }
      this.setData({ submitting: true, error: '' })
      wx.showLoading({ title: ko ? '제출 중' : '正在提交', mask: true })

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
        wx.showToast({ title: ko ? '제출 완료' : '提交成功', icon: 'success' })
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/request/detail?id=' + request.id + '&created=1'
          })
        }, 700)
      }).catch(function (err) {
        wx.hideLoading()
        self.setData({
          submitting: false,
          error: err.message || (ko ? '제출에 실패했습니다' : '提交失败，请重试')
        })
        wx.showToast({ title: err.message || (ko ? '제출 실패' : '提交失败'), icon: 'none' })
      })
    },

    showError(message) {
      this.setData({ error: message })
      wx.showToast({ title: message, icon: 'none' })
    }
  }
}

module.exports = createRequestPage
