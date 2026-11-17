const LANG_KEY = 'xct_lang'
const SUPPORTED = ['zh', 'ko']
const TAB_LABELS = {
  zh: ['首页', 'AI 网格员', '个人中心'],
  ko: ['홈', 'AI 상담', '내 정보']
}

const NAV_TITLES = {
  'pages/index/index': '신위안촌 정황통',
  'pages/article/list': '마을 소식',
  'pages/article/detail': '소식 상세',
  'pages/gov/index': '정무 서비스',
  'pages/gov/detail': '민원 안내',
  'pages/gov/apply': '온라인 신청',
  'pages/gov/applies': '나의 민원',
  'pages/gov/apply-detail': '민원 상세',
  'pages/request/create': '요구 제출',
  'pages/request/list': '나의 요구',
  'pages/request/detail': '요구 상세',
  'pages/service/index': '편의 서비스',
  'pages/ai/ai': 'AI 상담',
  'pages/ai/history': '대화 기록',
  'pages/family/index': '가족 구성원',
  'pages/workbench/index': '관리자 워크스테이션',
  'pages/workbench/request-detail': '민원 처리',
  'pages/profile/profile': '내 정보',
  'pages/profile/edit': '정보 수정'
}

function getLang() {
  try {
    const value = wx.getStorageSync(LANG_KEY)
    return SUPPORTED.indexOf(value) >= 0 ? value : 'zh'
  } catch (e) {
    return 'zh'
  }
}

function setLang(lang) {
  const next = SUPPORTED.indexOf(lang) >= 0 ? lang : 'zh'
  try {
    wx.setStorageSync(LANG_KEY, next)
  } catch (e) {}
  try {
    const app = getApp()
    if (app && app.globalData) app.globalData.lang = next
  } catch (e) {}
  applyTabBar(next)
  return next
}

function applyTabBar(lang) {
  if (!wx.setTabBarItem) return
  const labels = TAB_LABELS[lang === 'ko' ? 'ko' : 'zh']
  labels.forEach(function (text, index) {
    wx.setTabBarItem({
      index: index,
      text: text,
      fail: function () {}
    })
  })
}

function applyNavTitle(route) {
  if (!wx.setNavigationBarTitle || getLang() !== 'ko' || !route) return
  const title = NAV_TITLES[route]
  if (title) wx.setNavigationBarTitle({ title: title })
}

function label(zh, ko) {
  return getLang() === 'ko' ? ko : zh
}

/**
 * 后端按契约返回 i18n.ko 时，用它覆盖展示字段。
 * 只覆盖后端明确给出的字段，不改用户填写内容，也不改逻辑字段。
 */
function localizeResponse(value) {
  if (getLang() !== 'ko' || value == null) return value
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = localizeResponse(value[i])
    return value
  }
  if (typeof value !== 'object') return value
  const translated = value.i18n && value.i18n.ko
  if (translated && typeof translated === 'object') {
    Object.keys(translated).forEach(function (key) {
      if (key !== 'i18n') value[key] = translated[key]
    })
  }
  Object.keys(value).forEach(function (key) {
    if (key !== 'i18n' && value[key] && typeof value[key] === 'object') {
      value[key] = localizeResponse(value[key])
    }
  })
  return value
}

module.exports = {
  LANG_KEY: LANG_KEY,
  getLang: getLang,
  setLang: setLang,
  applyTabBar: applyTabBar,
  applyNavTitle: applyNavTitle,
  label: label,
  localizeResponse: localizeResponse
}
