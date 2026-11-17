const app = getApp()
const userApi = require('../../api/user')
const authApi = require('../../api/auth')
const config = require('../../utils/config')
const storage = require('../../utils/storage')
const i18n = require('../../utils/i18n')

function normalizeAvatarUrl(url) {
  if (!url) return ''
  const text = String(url)
  const base = config.BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (text.charAt(0) === '/') return base + text
  return text.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, base)
}

function decorate(user) {
  if (!user) return null
  const joined = String(user.joinedAt || '').split('-')
  const joinedText = joined.length === 3 ? joined[0] + '年' + Number(joined[1]) + '月加入' : ''
  const joinedTextKo = joined.length === 3 ? joined[0] + '년 ' + Number(joined[1]) + '월 가입' : ''
  const stats = user.stats || {}
  const displayName = user.nickname || user.name || '村民'
  const worker = user.gridWorker || {
    name: '李建国',
    phoneDisplay: '138****9072',
    phone: '13843219072',
    duty: '周一至周五 10:00—19:30'
  }
  return Object.assign({}, user, {
    avatarUrl: normalizeAvatarUrl(user.avatarUrl),
    displayName: displayName,
    avatarText: user.avatarText || displayName.charAt(0),
    joinedText: joinedText,
    joinedTextKo: joinedTextKo,
    isAdmin: user.roleCode === 'admin',
    roleNameKo: user.roleCode === 'admin' ? '관리자' : '주민',
    regionPath: user.regionPath || ['永吉县', '口前镇', '新源村'],
    gridWorker: Object.assign({}, worker, {
      initial: String(worker.name || '李').charAt(0)
    }),
    statList: [{
      key: 'applies',
      label: '我的办件',
      labelKo: '나의 민원',
      value: stats.applies || 0,
      icon: '件',
      tint: '#FBEBEB',
      color: '#C4161C',
      badge: ''
    }, {
      key: 'appeals',
      label: '我的诉求',
      labelKo: '나의 요구',
      value: stats.appeals || 0,
      icon: '诉',
      tint: '#FDF0E8',
      color: '#C2571A',
      badge: ''
    }, {
      key: 'ratings',
      label: '待评价',
      labelKo: '평가 대기',
      value: stats.ratings || 0,
      icon: '评',
      tint: '#EAF4EE',
      color: '#2F8A59',
      badge: ''
    }]
  })
}

Page({
  data: {
    user: null,
    loggedIn: false,
    loading: true,
    avatarFailed: false,
    loginMode: 'wechat',
    loginRole: 'villager',
    account: '',
    password: '',
    showPassword: false,
    loginError: '',
    loginLoading: false,
    showAbout: false,
    lang: i18n.getLang(),
    version: config.APP_VERSION,
    menuGroups: [{
      title: '政务服务',
      titleKo: '정무 서비스',
      items: [{
        code: 'gov_guide',
        name: '办事指南',
        nameKo: '민원 안내',
        desc: '医保、养老、高龄补贴、独生子女证',
        descKo: '의료보험·연금·고령수당·외동자녀증',
        icon: '办',
        tint: '#FBEBEB',
        color: '#C4161C',
        action: 'gov',
        badge: '',
        badgeType: ''
      }, {
        code: 'my_applies',
        name: '我的办件',
        nameKo: '나의 민원',
        desc: '查看申报记录与办理进度',
        descKo: '신청 기록과 처리 진행 상황',
        icon: '件',
        tint: '#FDF0E8',
        color: '#D06A2D',
        action: 'applies',
        badge: '可用',
        badgeType: 'tel'
      }, {
        code: 'my_appeals',
        name: '我的诉求',
        nameKo: '나의 요구',
        desc: '提交诉求并跟踪办理结果',
        descKo: '요구를 제출하고 처리 결과 확인',
        icon: '诉',
        tint: '#FAF3E3',
        color: '#BE8430',
        action: 'appeals',
        badge: '可用',
        badgeType: 'tel'
      }]
    }, {
      title: '便民服务',
      titleKo: '편의 서비스',
      items: [{
        code: 'directory',
        name: '服务黄页',
        nameKo: '서비스 전화번호부',
        desc: '水、电、气、暖、维修电话',
        descKo: '수도·전기·가스·난방·수리 전화',
        icon: '黄',
        tint: '#F8EAEA',
        color: '#B3202A',
        action: 'directory',
        badge: '可用',
        badgeType: 'tel'
      }, {
        code: 'family',
        name: '家庭成员',
        nameKo: '가족 구성원',
        desc: '维护父母、配偶、子女信息',
        descKo: '부모·배우자·자녀 정보 관리',
        icon: '家',
        tint: '#F1EEF8',
        color: '#7563A8',
        action: 'family',
        badge: '可用',
        badgeType: 'tel'
      }, {
        code: 'customer',
        name: '在线客服',
        nameKo: '온라인 상담',
        desc: '村党群服务中心 · 0432-64216888',
        descKo: '촌당군민봉사센터 · 0432-64216888',
        icon: '客',
        tint: '#EAF4EE',
        color: '#2F8A59',
        action: 'call',
        badge: '电话',
        badgeType: 'tel'
      }, {
        code: 'language',
        name: '语言设置',
        nameKo: '언어 설정',
        desc: '简体中文 / 조선어',
        descKo: '중국어 / 조선어',
        icon: '语',
        tint: '#F1EEF8',
        color: '#7563A8',
        action: 'language',
        badge: '中/조',
        badgeType: 'tel'
      }]
    }, {
      title: '账号与设置',
      titleKo: '계정 및 설정',
      items: [{
        code: 'profile_edit',
        name: '修改资料',
        nameKo: '정보 수정',
        desc: '修改昵称与个人资料',
        descKo: '닉네임과 개인 정보 수정',
        icon: '资',
        tint: '#F1F3F6',
        color: '#5D6B80',
        action: 'edit',
        badge: '',
        badgeType: ''
      }, {
        code: 'clear_cache',
        name: '清除缓存',
        nameKo: '캐시 삭제',
        desc: '清理本地点赞与 AI 对话记录',
        descKo: '로컬 좋아요와 AI 대화 기록 정리',
        icon: '清',
        tint: '#F6F1ED',
        color: '#8A7A6D',
        action: 'clear',
        badge: '',
        badgeType: ''
      }, {
        code: 'about',
        name: '关于平台',
        nameKo: '플랫폼 소개',
        desc: '版本与功能说明',
        descKo: '버전과 기능 안내',
        icon: '关',
        tint: '#F1F3F6',
        color: '#5D6B80',
        action: 'about',
        badge: '',
        badgeType: ''
      }]
    }]
  },

  onLoad() {
    const cached = app.globalData.user
    if (cached) {
      this.setData({
        user: decorate(cached),
        loggedIn: true,
        loading: false
      })
    }
    this.loadUser()
  },

  onShow() {
    const lang = i18n.getLang()
    if (this.data.lang !== lang) this.setData({ lang: lang })
    if (wx.setNavigationBarTitle) {
      wx.setNavigationBarTitle({ title: lang === 'ko' ? '내 정보' : '个人中心' })
    }
    if (this.loadedOnce && this.data.loggedIn) {
      this.loadUser()
    }
  },

  loadUser() {
    const self = this
    app.ensureLogin().then(function () {
      return userApi.me()
    }).then(function (user) {
      self.setData({
        user: decorate(user),
        loggedIn: true,
        loading: false,
        avatarFailed: false
      })
      self.loadedOnce = true
    }).catch(function () {
      const fallback = app.globalData.user || storage.getUser()
      if (fallback) {
        self.setData({
          user: decorate(fallback),
          loggedIn: true,
          loading: false,
          avatarFailed: false
        })
        self.loadedOnce = true
      } else {
        self.setData({
          user: null,
          loggedIn: false,
          loading: false
        })
      }
    })
  },

  onAdminWorkbench() {
    wx.navigateTo({ url: '/pages/workbench/index' })
  },

  onMenuTap(e) {
    const ds = e.currentTarget.dataset
    const action = ds.action
    if (action === 'gov') {
      wx.navigateTo({ url: '/pages/gov/index' })
      return
    }
    if (action === 'applies') {
      wx.navigateTo({ url: '/pages/gov/applies' })
      return
    }
    if (action === 'appeals') {
      wx.navigateTo({ url: '/pages/request/list' })
      return
    }
    if (action === 'directory') {
      wx.navigateTo({ url: '/pages/service/index?tab=directory' })
      return
    }
    if (action === 'family') {
      wx.navigateTo({ url: '/pages/family/index' })
      return
    }
    if (action === 'call') {
      this.onCallHotline()
      return
    }
    if (action === 'language') {
      this.onLanguage()
      return
    }
    if (action === 'edit') {
      this.onEditProfile()
      return
    }
    if (action === 'clear') {
      this.onClearCache()
      return
    }
    if (action === 'about') {
      this.setData({ showAbout: true })
      return
    }
    if (action === 'locked') {
      wx.showModal({
        title: ds.name + ' · ' + (ds.version || 'V3') + ' 开放',
        content: ds.descText || '该功能将在后续版本开放。',
        confirmText: '知道了',
        showCancel: false,
        confirmColor: '#C4161C'
      })
    }
  },

  onStatsTap(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'applies' || key === 'ratings') {
      wx.navigateTo({ url: '/pages/gov/applies' })
      return
    }
    if (key === 'appeals') {
      wx.navigateTo({ url: '/pages/request/list' })
    }
  },

  onEditProfile() {
    if (!this.data.user) return
    wx.navigateTo({ url: '/pages/profile/edit' })
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清理本地点赞状态和 AI 对话记录，不影响账号资料。',
      confirmText: '清除',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        wx.removeStorageSync(config.STORAGE.LIKED)
        wx.removeStorageSync(config.STORAGE.AI_HISTORY)
        wx.removeStorageSync(config.STORAGE.AI_SESSIONS)
        wx.removeStorageSync(config.STORAGE.PENDING_Q)
        wx.removeStorageSync(config.STORAGE.PENDING_SESSION)
        wx.showToast({ title: '缓存已清除', icon: 'none' })
      }
    })
  },

  onCallHotline() {
    wx.makePhoneCall({ phoneNumber: '043264216888' })
  },

  onLanguage() {
    const self = this
    wx.showActionSheet({
      itemList: ['简体中文', '조선어'],
      success: function (res) {
        const next = res.tapIndex === 1 ? 'ko' : 'zh'
        if (next === i18n.getLang()) return
        i18n.setLang(next)
        wx.reLaunch({ url: '/pages/profile/profile' })
      }
    })
  },

  onCallWorker() {
    const user = this.data.user
    const phone = (user && user.gridWorker && user.gridWorker.phone) || '13843219072'
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/[^0-9]/g, '')
    })
  },

  onAvatarError() {
    this.setData({ avatarFailed: true })
  },

  onLoginMode(e) {
    const mode = e.currentTarget.dataset.mode === 'password' ? 'password' : 'wechat'
    if (mode === this.data.loginMode) return
    this.setData({
      loginMode: mode,
      loginError: '',
      showPassword: false
    })
  },

  onLoginRole(e) {
    const role = e.currentTarget.dataset.role === 'admin' ? 'admin' : 'villager'
    if (role === this.data.loginRole) return
    this.setData({ loginRole: role, loginError: '' })
  },

  onAccountInput(e) {
    this.setData({
      account: e.detail.value || '',
      loginError: ''
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value || '',
      loginError: ''
    })
  },

  onTogglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  onAccountLogin() {
    const self = this
    if (this.data.loginLoading) return
    const account = String(this.data.account || '').trim()
    const password = String(this.data.password || '')
    if (!account) {
      this.setData({ loginError: '请输入手机号或账号' })
      return
    }
    if (password.length < 6) {
      this.setData({ loginError: '密码至少 6 位' })
      return
    }
    this.setData({ loginLoading: true, loginError: '' })
    wx.showLoading({ title: '登录中', mask: true })
    authApi.passwordLogin(account, password).then(function (res) {
      const actualRole = res.user && res.user.roleCode === 'admin' ? 'admin' : 'villager'
      if (actualRole !== self.data.loginRole) {
        storage.clearAuth()
        app.globalData.user = null
        app.globalData.skipAutoLogin = true
        wx.hideLoading()
        self.setData({
          loginLoading: false,
          loginError: actualRole === 'admin'
            ? '该账号是管理员，请切换到「管理员」身份登录'
            : '该账号是居民，请切换到「居民」身份登录'
        })
        return
      }
      app.globalData.skipAutoLogin = false
      app.setUser(res.user)
      wx.hideLoading()
      self.setData({
        loginLoading: false,
        loginError: '',
        user: decorate(res.user),
        loggedIn: true,
        loading: false
      })
      self.loadedOnce = true
      if (actualRole === 'admin') {
        wx.navigateTo({ url: '/pages/workbench/index' })
      } else {
        self.loadUser()
      }
    }).catch(function (err) {
      wx.hideLoading()
      self.setData({
        loginLoading: false,
        loginError: err.message || '登录失败，请检查账号密码'
      })
    })
  },

  onLogin() {
    const self = this
    app.globalData.skipAutoLogin = false
    const task = config.USE_MOCK
      ? authApi.mockLogin().then(function (res) {
        app.setUser(res.user)
        return res.user
      })
      : authApi.wxLogin()
    wx.showLoading({ title: '登录中', mask: true })
    task.then(function () {
      wx.hideLoading()
      self.loadUser()
    }).catch(function (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    })
  },

  onLogout() {
    const self = this
    wx.showModal({
      title: '退出登录',
      content: '退出后将无法查看办件等个人信息。演示环境可随时重新登录。',
      confirmText: '退出',
      confirmColor: '#C4161C',
      success: function (res) {
        if (!res.confirm) return
        authApi.logout().then(function () {
          app.logout()
          self.setData({
            user: null,
            loggedIn: false,
            loginLoading: false,
            loginError: '',
            password: ''
          })
          wx.showToast({ title: '已退出登录', icon: 'none' })
        })
      }
    })
  },

  openAbout() {
    this.setData({ showAbout: true })
  },

  closeAbout() {
    this.setData({ showAbout: false })
  },

  noop() {},

  onShareAppMessage() {
    return {
      title: '新源村情通 · 村级事务服务平台',
      path: '/pages/index/index'
    }
  }
})

