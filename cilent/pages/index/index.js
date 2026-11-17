const app = getApp()
const homeApi = require('../../api/home')
const contentApi = require('../../api/content')
const config = require('../../utils/config')

const DEFAULT_REGION = {
  name: '新源村',
  gridName: '第三网格',
  households: 486,
  population: 1632
}

const ARTICLE_IMAGES = {
  a1001: '/assets/images/home/news-medical.jpg',
  a1010: '/assets/images/home/news-village.jpg',
  a1002: '/assets/images/home/news-finance.jpg',
  a1003: '/assets/images/home/news-apple.jpg'
}

const COLUMN_IMAGES = {
  c1: '/assets/images/home/news-village.jpg',
  c2: '/assets/images/home/news-finance.jpg',
  c3: '/assets/images/home/news-apple.jpg',
  c4: '/assets/images/home/news-medical.jpg'
}

const COLUMN_KO = {
  c1: '마을 소식',
  c2: '삼무 공개',
  c3: '향풍 기록',
  c4: '정책 속보'
}

const MODULE_KO = {
  consult: { name: '상담·대행', desc: '무엇이든 말씀하세요' },
  appeal: { name: '요구·건의', desc: '건마다 답변' },
  tea_meeting: { name: '온라인 간담회', desc: '마을 일 논의' },
  directory: { name: '서비스 전화번호부', desc: '수도·전기·가스 전화' },
  gov: { name: '정무 관리', desc: '4개 분야 민원' },
  jobs: { name: '취업 채용', desc: '집 근처 일자리' }
}

function decorateColumns(list) {
  return (list || []).map(function (item) {
    return Object.assign({}, item, {
      nameKo: COLUMN_KO[item.id] || item.name
    })
  })
}

function decorateModules(list) {
  return (list || []).map(function (item) {
    const ko = MODULE_KO[item.code] || {}
    return Object.assign({}, item, {
      nameKo: ko.name || item.name,
      descKo: ko.desc || item.desc
    })
  })
}

function decorateArticles(list) {
  return (list || []).map(function (item) {
    return Object.assign({}, item, {
      thumb: ARTICLE_IMAGES[item.id] || COLUMN_IMAGES[item.columnId] || '/assets/images/home/news-default.jpg'
    })
  })
}

function unifyModules(list) {
  return (list || []).map(function (item) {
    if (item.code === 'gov' || item.id === 'm5') {
      return Object.assign({}, item, {
        highlight: false,
        badge: '',
        tint: '#FBEBEB',
        icon: '/assets/icons/grid-gov.png'
      })
    }
    return item
  })
}

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    error: '',
    region: DEFAULT_REGION,
    notice: null,
    banner: null,
    columns: [],
    activeColumn: '',
    articles: [],
    modules: [],
    regions: [],
    gallery: [
      {
        id: 'g1',
        image: '/assets/images/home/hero-village.jpg',
        title: '乡村新貌',
        sub: '白墙灰瓦，村口新景'
      },
      {
        id: 'g2',
        image: '/assets/images/home/news-apple.jpg',
        title: '苹果助农',
        sub: '果园里的丰收季'
      },
      {
        id: 'g3',
        image: '/assets/images/home/banner-health.jpg',
        title: '幸福晚年',
        sub: '家门口的暖心服务'
      },
      {
        id: 'g4',
        image: '/assets/images/home/news-village.jpg',
        title: '村口日常',
        sub: '烟火气里的新源村'
      }
    ],
    footer: {
      hotline: '0432-64216888'
    },
    slogan: '听民意 · 解民忧 · 暖民心',
    sloganKo: '민의를 듣고 · 민의 근심을 풀고 · 민심을 따뜻하게',
    newsTitle: '最新动态',
    newsTitleKo: '최신 소식',
    newsSub: '村里的事，及时看',
    newsSubKo: '마을 소식, 바로 확인',
    listLoading: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    })
    this.loadHome()
  },

  onPullDownRefresh() {
    this.loadHome(true)
  },

  onShow() {
    // 管理员发布通知后，切回首页立即刷新通知条
    if (this.loadedOnce) this.loadHome(true)
  },

  loadHome(isRefresh) {
    const self = this
    if (!isRefresh) this.setData({ loading: true, error: '' })
    homeApi.getHome({
      regionId: app.globalData.region ? app.globalData.region.id : config.REGION_ID
    }).then(function (res) {
      const first = res.articles && res.articles[0]
      self.setData({
        loading: false,
        error: '',
        region: res.region || DEFAULT_REGION,
        notice: res.notice,
        banner: res.banner,
        columns: decorateColumns(res.columns),
        articles: decorateArticles(res.articles),
        modules: decorateModules(unifyModules(res.modules)),
        regions: res.regions || [],
        footer: res.footer || self.data.footer,
        newsTitle: '最新动态',
        newsTitleKo: '최신 소식',
        newsSub: '村里的事，及时看',
        newsSubKo: '마을 소식, 바로 확인'
      })
      app.globalData.region = res.region || null
      app.globalData.appConfig = app.globalData.appConfig || {}
      app.globalData.appConfig.footer = res.footer
      self.loadedOnce = true
      if (first) {
        app.globalData.unread = 0
      }
      if (isRefresh) wx.stopPullDownRefresh()
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '首页加载失败，请稍后重试'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  onColumnTap(e) {
    const id = e.currentTarget.dataset.id
    const next = this.data.activeColumn === id ? '' : id
    const column = this.data.columns.filter(function (c) {
      return c.id === next
    })[0]
    this.setData({
      activeColumn: next,
      newsTitle: column ? column.name : '最新动态',
      newsTitleKo: column ? (column.nameKo || column.name) : '최신 소식',
      newsSub: column ? column.description : '村里的事，及时看',
      newsSubKo: column ? (column.descriptionKo || column.description) : '마을 소식, 바로 확인',
      listLoading: true
    })
    this.loadColumnArticles(next)
  },

  loadColumnArticles(columnId) {
    const self = this
    contentApi.getArticles({
      columnId: columnId,
      page: 1,
      pageSize: 4
    }).then(function (res) {
      if (self.data.activeColumn !== columnId) return
      self.setData({
        articles: decorateArticles(res.list),
        listLoading: false
      })
    }).catch(function () {
      self.setData({
        listLoading: false
      })
      wx.showToast({ title: '资讯加载失败', icon: 'none' })
    })
  },

  onNotice() {
    if (!this.data.notice || !this.data.notice.articleId) return
    this.openArticle(this.data.notice.articleId)
  },

  onBanner() {
    if (!this.data.banner || !this.data.banner.articleId) return
    this.openArticle(this.data.banner.articleId)
  },

  onArticle(e) {
    this.openArticle(e.currentTarget.dataset.id)
  },

  openArticle(id) {
    if (!id) return
    wx.navigateTo({
      url: '/pages/article/detail?id=' + id
    })
  },

  onMoreArticles() {
    const columnId = this.data.activeColumn || ''
    wx.navigateTo({
      url: '/pages/article/list' + (columnId ? '?columnId=' + columnId : '')
    })
  },

  onEmptyAction() {
    if (this.data.activeColumn) {
      this.setData({
        activeColumn: '',
        newsTitle: '最新动态',
        newsTitleKo: '최신 소식',
        newsSub: '村里的事，及时看',
        newsSubKo: '마을 소식, 바로 확인',
        listLoading: true
      })
      this.loadColumnArticles('')
      return
    }
    this.loadHome()
  },

  onModuleTap(e) {
    const ds = e.currentTarget.dataset
    if (ds.status === 'online' && ds.route) {
      wx.navigateTo({ url: ds.route })
      return
    }
    wx.showModal({
      title: ds.name,
      content: '「' + ds.name + '」将在 ' + (ds.version || 'V2') + ' 版本开放。\n\nV1 已开放「政务管理」，可先查看医保、养老、高龄补贴等四类事项的办事指南。',
      confirmText: '去看政务',
      cancelText: '知道了',
      confirmColor: '#C4161C',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/gov/index' })
        }
      }
    })
  },

  onSwitchVillage() {
    const regions = this.data.regions || []
    if (!regions.length) {
      wx.showToast({ title: '当前为新源村演示数据', icon: 'none' })
      return
    }
    const names = regions.map(function (r) {
      if (r.status === 'online') return r.name + '（当前）'
      return r.name + '（数据接入中）'
    })
    wx.showActionSheet({
      itemList: names,
      success: function (res) {
        const target = regions[res.tapIndex]
        if (!target) return
        if (target.status !== 'online') {
          wx.showToast({
            title: '该村数据接入中，先看新源村',
            icon: 'none',
            duration: 2400
          })
        }
      }
    })
  },

  retry() {
    this.loadHome()
  },

  onShareAppMessage() {
    return {
      title: '新源村情通 · 村里的事，掌上就办',
      path: '/pages/index/index'
    }
  }
})
