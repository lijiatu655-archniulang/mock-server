const govApi = require('../../api/gov')

Page({
  data: {
    categories: [],
    allTotal: 0,
    activeCategory: 'all',
    items: [],
    total: 0,
    keyword: '',
    searchInput: '',
    loading: true,
    error: '',
    activeName: '全部事项'
  },

  onLoad() {
    this.loadCategories()
    this.fetchItems()
  },

  onUnload() {
    if (this.searchTimer) clearTimeout(this.searchTimer)
  },

  loadCategories() {
    const self = this
    govApi.getCategories().then(function (res) {
      const categories = res.list || []
      const all = categories.filter(function (c) {
        return c.id === 'all'
      })[0]
      self.setData({
        categories: categories,
        allTotal: all ? all.count : res.total
      })
    }).catch(function () {})
  },

  fetchItems() {
    const self = this
    const seq = (this.seq || 0) + 1
    this.seq = seq
    this.setData({ loading: true, error: '' })
    govApi.getItems({
      categoryId: this.data.activeCategory,
      keyword: this.data.keyword
    }).then(function (res) {
      if (seq !== self.seq) return
      const current = self.data.categories.filter(function (c) {
        return c.id === self.data.activeCategory
      })[0]
      self.setData({
        items: res.list || [],
        total: res.total || 0,
        loading: false,
        activeName: current ? current.name : '全部事项'
      })
    }).catch(function (err) {
      if (seq !== self.seq) return
      self.setData({
        loading: false,
        error: err.message || '事项加载失败'
      })
    })
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeCategory) return
    this.setData({
      activeCategory: id,
      items: []
    })
    this.fetchItems()
  },

  onSearchInput(e) {
    const value = e.detail.value
    const self = this
    this.setData({ searchInput: value })
    if (this.searchTimer) clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(function () {
      if (value !== self.data.keyword) {
        self.setData({ keyword: value })
        self.fetchItems()
      }
    }, 420)
  },

  onSearchConfirm() {
    if (this.searchTimer) clearTimeout(this.searchTimer)
    if (this.data.searchInput !== this.data.keyword) {
      this.setData({ keyword: this.data.searchInput })
      this.fetchItems()
    }
  },

  onClearSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer)
    this.setData({
      searchInput: '',
      keyword: ''
    })
    this.fetchItems()
  },

  onItemTap(e) {
    const code = e.currentTarget.dataset.code
    wx.navigateTo({
      url: '/pages/gov/detail?code=' + code
    })
  },

  retry() {
    this.fetchItems()
  },

  onShareAppMessage() {
    return {
      title: '新源村政务服务指南 · 四类高频事项一次看懂',
      path: '/pages/gov/index'
    }
  }
})
