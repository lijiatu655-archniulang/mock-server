const contentApi = require('../../api/content')
const storage = require('../../utils/storage')
const systemApi = require('../../api/system')

Page({
  data: {
    id: '',
    article: null,
    loading: true,
    error: '',
    liked: false,
    likes: 0,
    views: 0,
    likeLoading: false
  },

  onLoad(options) {
    const id = (options && options.id) || ''
    this.setData({ id: id })
    this.loadArticle(id)
  },

  loadArticle(id) {
    const self = this
    if (!id) {
      this.setData({ loading: false, error: '缺少文章编号' })
      return
    }
    this.setData({ loading: true, error: '' })
    contentApi.getArticle(id).then(function (article) {
      const liked = storage.isLiked(id) || !!article.liked
      self.setData({
        article: article,
        loading: false,
        liked: liked,
        likes: article.likes,
        views: article.views
      })
      wx.setNavigationBarTitle({ title: article.columnName || '资讯详情' })
      systemApi.reportEvent('article_view', {
        articleId: id,
        columnId: article.columnId
      })
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '文章加载失败'
      })
    })
  },

  onLike() {
    const self = this
    if (this.data.likeLoading || !this.data.article) return
    const next = !this.data.liked
    this.setData({
      liked: next,
      likes: this.data.likes + (next ? 1 : -1),
      likeLoading: true
    })
    contentApi.likeArticle(this.data.id, next).then(function (res) {
      storage.markLiked(self.data.id, res.liked)
      self.setData({
        liked: res.liked,
        likes: res.likes,
        likeLoading: false
      })
      if (res.liked) {
        wx.showToast({ title: '点赞成功', icon: 'none' })
      }
    }).catch(function () {
      self.setData({
        liked: !next,
        likes: self.data.likes - (next ? 1 : -1),
        likeLoading: false
      })
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    })
  },

  onPrev() {
    const prev = this.data.article && this.data.article.prev
    if (!prev) return
    wx.redirectTo({ url: '/pages/article/detail?id=' + prev.id })
  },

  onNext() {
    const next = this.data.article && this.data.article.next
    if (!next) return
    wx.redirectTo({ url: '/pages/article/detail?id=' + next.id })
  },

  onCall() {
    wx.makePhoneCall({
      phoneNumber: '09995021688'
    })
  },

  retry() {
    this.loadArticle(this.data.id)
  },

  onShareAppMessage() {
    const article = this.data.article
    return {
      title: article ? article.title : '新源村情通',
      path: '/pages/article/detail?id=' + this.data.id
    }
  }
})
