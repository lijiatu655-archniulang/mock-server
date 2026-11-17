const contentApi = require('../../api/content')
const homeApi = require('../../api/home')

const COLUMN_KO = {
  c1: '마을 소식',
  c2: '삼무 공개',
  c3: '향풍 기록',
  c4: '정책 속보'
}

function columnsKo(list) {
  return (list || []).map(function (item) {
    return Object.assign({}, item, { nameKo: COLUMN_KO[item.id] || item.name })
  })
}

Page({
  data: {
    columns: [],
    activeColumn: '',
    activeName: '全部',
    activeNameKo: '전체',
    articles: [],
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
    loading: true,
    loadingMore: false,
    error: ''
  },

  onLoad(options) {
    const columnId = (options && options.columnId) || ''
    this.setData({
      activeColumn: columnId
    })
    this.loadColumns()
    this.loadArticles(1, true)
  },

  onPullDownRefresh() {
    this.loadArticles(1, true, true)
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading || this.data.loadingMore) return
    this.loadArticles(this.data.page + 1, false)
  },

  loadColumns() {
    const self = this
    homeApi.getColumns().then(function (res) {
      const columns = columnsKo(res.list)
      const current = columns.filter(function (c) {
        return c.id === self.data.activeColumn
      })[0]
      self.setData({
        columns: columns,
        activeName: current ? current.name : '全部',
        activeNameKo: current ? current.nameKo : '전체'
      })
      if (current) {
        wx.setNavigationBarTitle({ title: current.name })
      }
    }).catch(function () {})
  },

  loadArticles(page, replace, isRefresh) {
    const self = this
    if (replace) {
      this.setData({ loading: true, error: '' })
    } else {
      this.setData({ loadingMore: true })
    }
    contentApi.getArticles({
      columnId: this.data.activeColumn,
      page: page,
      pageSize: this.data.pageSize
    }).then(function (res) {
      const list = res.list || []
      const next = replace ? list : self.data.articles.concat(list)
      self.setData({
        articles: next,
        page: page,
        total: res.total || 0,
        hasMore: !!res.hasMore,
        loading: false,
        loadingMore: false,
        error: ''
      })
      if (isRefresh) wx.stopPullDownRefresh()
    }).catch(function (err) {
      self.setData({
        loading: false,
        loadingMore: false,
        error: err.message || '资讯加载失败'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  onColumnTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeColumn) return
    const current = this.data.columns.filter(function (c) {
      return c.id === id
    })[0]
    this.setData({
      activeColumn: id,
      activeName: current ? current.name : '全部',
      articles: [],
      page: 1,
      hasMore: false
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 180 })
    wx.setNavigationBarTitle({ title: current ? current.name : '村情资讯' })
    this.loadArticles(1, true)
  },

  onArticle(e) {
    wx.navigateTo({
      url: '/pages/article/detail?id=' + e.currentTarget.dataset.id
    })
  },

  retry() {
    this.loadArticles(1, true)
  },

  onShareAppMessage() {
    return {
      title: '新源村情通 · 村情资讯',
      path: '/pages/article/list' + (this.data.activeColumn ? '?columnId=' + this.data.activeColumn : '')
    }
  }
})
