const serviceApi = require('../../api/service')

const TABS = [{
  key: 'directory',
  name: '服务黄页',
  title: '服务黄页',
  icon: '电',
  sub: '水电气暖',
  nameKo: '서비스 전화번호부',
  subKo: '수도·전기·가스·난방'
}, {
  key: 'jobs',
  name: '就业招聘',
  title: '就业招聘',
  icon: '岗',
  sub: '家门口的工作',
  nameKo: '취업 채용',
  subKo: '집 근처 일자리'
}, {
  key: 'tea',
  name: '线上奶茶会',
  title: '线上奶茶会',
  icon: '茶',
  sub: '议村里的事',
  nameKo: '온라인 간담회',
  subKo: '마을 의제 논의'
}]

const TEA_LOCAL = {
  t1: {
    title: '入冬取暖和防一氧化碳中毒',
    date: '2026-11-20 19:30',
    location: '新源村党群服务中心二楼',
    host: '村两委 · 网格员',
    summary: '东北入冬早，一起议煤炉取暖、一氧化碳报警器安装、独居老人和脱贫户上门检查。',
    agenda: ['通报全村取暖方式和隐患排查情况', '议报警器安装、煤炉通风和秸秆禁烧', '确定网格员包保到户名单和上门时间']
  },
  t2: {
    title: '医保缴费扫尾和老人代缴',
    date: '2026-12-05 19:30',
    location: '新源村党群服务中心一楼便民窗口',
    host: '村医保专干 刘芳',
    summary: '2026 年度医保集中缴费到 12 月 31 日，议外出务工、老人和断保人员怎么缴、谁帮着代缴。',
    agenda: ['演示“吉林税务社保缴费”小程序', '统计需要上门代缴的老人和断保人员', '确定集中代缴和补缴提醒时间']
  },
  t3: {
    title: '玉米储存和卖粮那些事',
    date: '2026-11-08 19:30',
    location: '新源村党群服务中心二楼',
    host: '村新时代文明实践站 · 种植大户',
    summary: '秋收后玉米露天存放容易返潮、霉变，一起议储粮、测水、卖粮渠道和电商助农。',
    agenda: ['通报今年玉米产量和收购行情', '议庭院储粮、防霉防鼠和测水卖粮', '商量电商直播和合作社统一销售']
  }
}

function localizeTea(item) {
  const local = TEA_LOCAL[item.id]
  return local ? Object.assign({}, item, local) : item
}

Page({
  data: {
    tabs: TABS,
    tab: 'directory',
    directoryGroups: [],
    jobs: [],
    teas: [],
    signed: {},
    stats: {
      services: 0,
      jobs: 0,
      teas: 0
    },
    loading: true,
    error: ''
  },

  onLoad(options) {
    const tab = (options && options.tab) || 'directory'
    this.setTab(tab)
    this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll(true)
  },

  setTab(tab) {
    const current = TABS.filter(function (item) {
      return item.key === tab
    })[0] || TABS[0]
    this.setData({ tab: current.key })
    wx.setNavigationBarTitle({ title: current.title })
  },

  onTabTap(e) {
    this.setTab(e.currentTarget.dataset.tab)
  },

  loadAll(isRefresh) {
    const self = this
    if (!this.loadedOnce) this.setData({ loading: true, error: '' })
    Promise.all([
      serviceApi.getDirectory(),
      serviceApi.getJobs(),
      serviceApi.getTeaMeetings()
    ]).then(function (results) {
      const directory = results[0]
      const directoryList = directory.list || []
      const groups = (directory.categories || []).map(function (category) {
        return {
          name: category,
          list: directoryList.filter(function (item) {
            return item.category === category
          })
        }
      }).filter(function (group) {
        return group.list.length
      })
      const jobs = results[1].list || []
      const teas = (results[2].list || []).map(function (item) {
        return Object.assign({}, localizeTea(item), {
          signed: !!self.data.signed[item.id],
          percent: Math.min(100, Math.round((item.joined / item.total) * 100))
        })
      })
      self.setData({
        directoryGroups: groups,
        jobs: jobs,
        teas: teas,
        stats: {
          services: directoryList.length,
          jobs: jobs.length,
          teas: teas.length
        },
        tabs: TABS.map(function (item) {
          const count = item.key === 'directory' ? directoryList.length
            : item.key === 'jobs' ? jobs.length : teas.length
          return Object.assign({}, item, { count: count })
        }),
        loading: false,
        error: ''
      })
      self.loadedOnce = true
      if (isRefresh) wx.stopPullDownRefresh()
    }).catch(function (err) {
      self.setData({
        loading: false,
        error: err.message || '便民服务加载失败'
      })
      if (isRefresh) wx.stopPullDownRefresh()
    })
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/[^0-9]/g, '')
    })
  },

  onSignup(e) {
    const id = e.currentTarget.dataset.id
    const current = this.data.teas.filter(function (item) {
      return item.id === id
    })[0]
    if (!current || current.status !== '报名中') return
    if (current.signed) {
      wx.showToast({ title: '您已报名', icon: 'none' })
      return
    }
    const teas = this.data.teas.map(function (item) {
      if (item.id !== id) return item
      const joined = item.joined + 1
      return Object.assign({}, item, {
        joined: joined,
        percent: Math.min(100, Math.round((joined / item.total) * 100)),
        signed: true
      })
    })
    const signed = Object.assign({}, this.data.signed)
    signed[id] = true
    this.setData({
      teas: teas,
      signed: signed
    })
    wx.showToast({ title: '报名成功，记得按时参加', icon: 'none' })
  },

  retry() {
    this.loadAll()
  }
})
