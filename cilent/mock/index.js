/**
 * Mock 路由：按 /api/v1 契约返回数据
 * 不依赖网络，保证省赛现场断网也能完整演示
 */
const data = require('./data')
const ai = require('./ai')
const format = require('../utils/format')

const runtime = {
  views: {},
  likes: {},
  liked: {},
  conversations: [],
  applies: JSON.parse(JSON.stringify(data.seedApplies || [])),
  requests: JSON.parse(JSON.stringify(data.seedRequests || []))
}

function envelope(payload, code, message) {
  return {
    code: code === undefined ? 0 : code,
    message: message || (code ? '操作失败' : 'ok'),
    data: payload === undefined ? null : payload,
    traceId: 'mock-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now()
  }
}

function fail(code, message) {
  return envelope(null, code, message)
}

function delay(res, ms) {
  const wait = ms === undefined ? 140 + Math.floor(Math.random() * 90) : ms
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(res)
    }, wait)
  })
}

function getArticle(id) {
  return data.articles.filter(function (a) {
    return a.id === id
  })[0]
}

function sortedArticles() {
  return data.articles.slice().sort(function (a, b) {
    if (a.isTop !== b.isTop) return a.isTop ? -1 : 1
    return String(b.publishedAt).localeCompare(String(a.publishedAt))
  })
}

function card(a) {
  const column = data.columns.filter(function (c) {
    return c.id === a.columnId
  })[0] || {}
  return {
    id: a.id,
    columnId: a.columnId,
    columnName: column.name || '',
    columnCode: column.code || '',
    columnColor: column.color || '#C4161C',
    title: a.title,
    summary: a.summary,
    isTop: a.isTop,
    publishedAt: a.publishedAt,
    displayDate: format.friendlyDate(a.publishedAt),
    views: runtime.views[a.id] || a.views,
    likes: runtime.likes[a.id] || a.likes,
    source: a.source
  }
}

function currentUser(token) {
  if (!token) return null
  return data.user
}

function handleAuth(path, method, params, body) {
  if (path === '/auth/mock-login' && method === 'POST') {
    const token = 'mock.' + data.user.id + '.' + Date.now()
    return delay(envelope({
      token: token,
      tokenType: 'Bearer',
      expiresIn: 604800,
      isNewUser: false,
      user: data.user
    }))
  }
  if (path === '/auth/wx-login' && method === 'POST') {
    // 真实环境由后端 code2Session；Mock 直接返回种子用户
    const token = 'mock.' + data.user.id + '.' + Date.now()
    return delay(envelope({
      token: token,
      tokenType: 'Bearer',
      expiresIn: 604800,
      isNewUser: false,
      user: data.user
    }))
  }
  if (path === '/auth/logout' && method === 'POST') {
    return delay(envelope(true))
  }
  return null
}

function flattenVillages() {
  const list = []
  function walk(nodes) {
    ;(nodes || []).forEach(function (node) {
      if (node.level === 3) {
        list.push({
          id: node.id,
          name: node.name,
          status: node.status,
          grid: node.grid
        })
      }
      if (node.children) walk(node.children)
    })
  }
  walk(data.regionTree)
  return list
}

function handleHome() {
  const latest = sortedArticles().slice(0, 4).map(card)
  return delay(envelope({
    region: {
      id: data.village.id,
      name: data.village.name,
      fullName: data.village.fullName,
      gridName: data.village.gridName,
      regionPath: data.village.regionPath,
      gridWorker: data.village.gridWorker,
      households: data.village.households,
      population: data.village.population
    },
    regions: flattenVillages(),
    notice: data.notice,
    banner: data.banner,
    columns: data.columns,
    articles: latest,
    modules: data.modules,
    footer: data.footer,
    serverTime: '2026-11-14 13:30:00'
  }))
}

/* ---------------- 办件 / 诉求 / 便民服务 ---------------- */

function pad2(n) {
  return n < 10 ? '0' + n : String(n)
}

function nowText() {
  const d = new Date()
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
    ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}

function addWorkdays(days) {
  const d = new Date()
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const week = d.getDay()
    if (week !== 0 && week !== 6) added += 1
  }
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' 19:30'
}

function getGovItem(code) {
  return data.govItems.filter(function (item) {
    return item.code === code
  })[0]
}

function applyStatusLabel(status) {
  return data.applyStatusLabels[status] || status
}

function requestStatusLabel(status) {
  return data.requestStatusLabels[status] || status
}

function findApply(id) {
  return runtime.applies.filter(function (item) {
    return item.id === id
  })[0]
}

function findRequest(id) {
  return runtime.requests.filter(function (item) {
    return item.id === id
  })[0]
}

function applyCard(item) {
  return {
    id: item.id,
    applyNo: item.applyNo,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemShortName: item.itemShortName,
    status: item.status,
    statusLabel: applyStatusLabel(item.status),
    amount: item.amount || 0,
    createdAt: item.createdAt,
    promiseAt: item.promiseAt,
    canRate: item.status === 'COMPLETED' && !item.rating
  }
}

function applyDetail(item) {
  const govItem = getGovItem(item.itemCode) || {}
  return Object.assign({}, item, {
    statusLabel: applyStatusLabel(item.status),
    itemPhone: govItem.phone || '0999-5021688',
    itemAddress: govItem.address || '新源村党群服务中心',
    canCancel: item.status === 'SUBMITTED' || item.status === 'DRAFT',
    canRate: item.status === 'COMPLETED' && !item.rating,
    canPay: item.status === 'APPROVED',
    hasRated: !!item.rating,
    ratingScore: item.rating ? item.rating.score : 0
  })
}

function requestCard(item) {
  return {
    id: item.id,
    requestNo: item.requestNo,
    type: item.type,
    typeLabel: item.typeLabel,
    title: item.title,
    content: item.content,
    status: item.status,
    statusLabel: item.rating ? '已评价' : requestStatusLabel(item.status),
    createdAt: item.createdAt,
    canRate: item.status === 'COMPLETED' && !item.rating,
    canUrge: item.status !== 'COMPLETED' && item.status !== 'RATED' && item.status !== 'CLOSED'
  }
}

function requestDetail(item) {
  return Object.assign({}, item, {
    statusLabel: item.rating ? '已评价' : requestStatusLabel(item.status),
    canRate: item.status === 'COMPLETED' && !item.rating,
    canUrge: item.status !== 'COMPLETED' && item.status !== 'RATED' && item.status !== 'CLOSED',
    hasRated: !!item.rating
  })
}

function handleApply(path, method, params, body, token) {
  if (path !== '/gov/applies' && path.indexOf('/gov/applies/') !== 0) return null
  if (!currentUser(token)) return delay(fail(20001, '请先登录'))
  if (path === '/gov/applies' && method === 'GET') {
    const status = params.status || ''
    let list = runtime.applies.slice()
    if (status === 'processing') {
      list = list.filter(function (item) {
        return ['SUBMITTED', 'ACCEPTED', 'SUPPLEMENT', 'APPROVED', 'PAID'].indexOf(item.status) >= 0
      })
    } else if (status === 'done') {
      list = list.filter(function (item) {
        return ['COMPLETED', 'REJECTED', 'CANCELED'].indexOf(item.status) >= 0
      })
    } else if (status) {
      list = list.filter(function (item) {
        return item.status === status
      })
    }
    list.sort(function (a, b) {
      return String(b.createdAt).localeCompare(String(a.createdAt))
    })
    return delay(envelope({
      list: list.map(applyCard),
      total: list.length,
      page: 1,
      pageSize: list.length,
      hasMore: false
    }), 120)
  }

  if (path === '/gov/applies' && method === 'POST') {
    const item = getGovItem(body.itemCode)
    if (!item) return delay(fail(40402, '事项不存在或已下线'), 120)
    const formData = body.formData || {}
    const required = (item.formFields || []).filter(function (f) {
      return f.required
    })
    const missingFields = required.filter(function (f) {
      return !String(formData[f.label] || '').trim()
    }).map(function (f) {
      return f.label
    })
    if (missingFields.length) {
      return delay(fail(40001, '请填写：' + missingFields.join('、')), 120)
    }
    const uploadedNames = body.materialNames || []
    const materials = (item.materials || []).map(function (m) {
      return {
        name: m.name,
        required: !!m.required,
        uploaded: uploadedNames.indexOf(m.name) >= 0
      }
    })
    const missingMaterials = materials.filter(function (m) {
      return m.required && !m.uploaded
    }).map(function (m) {
      return m.name
    })
    const d = new Date()
    const seq = ('0000' + (runtime.applies.length + 1)).slice(-4)
    const applyNo = 'SB' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + seq
    const createdAt = nowText()
    const itemData = {
      id: 'ap' + Date.now(),
      applyNo: applyNo,
      itemCode: item.code,
      itemName: item.name,
      itemShortName: item.shortName,
      status: 'SUBMITTED',
      amount: item.code === 'YB001' ? 38000 : 0,
      createdAt: createdAt,
      promiseAt: addWorkdays(3),
      rating: 0,
      formData: formData,
      materials: materials,
      missingMaterials: missingMaterials,
      agentUserId: body.agentUserId || null,
      agentName: body.agentUserId ? '网格员 李建国' : '',
      logs: [{
        status: 'SUBMITTED',
        label: '已提交',
        time: createdAt,
        operator: '王秀兰',
        note: missingMaterials.length ? '提交申请，待补：' + missingMaterials.join('、') : '提交申请，等待受理'
      }]
    }
    runtime.applies.unshift(itemData)
    return delay(envelope(applyDetail(itemData)), 260)
  }

  let match = path.match(/^\/gov\/applies\/([^/]+)\/cancel$/)
  if (match && method === 'POST') {
    const item = findApply(match[1])
    if (!item) return delay(fail(40402, '办件不存在'), 100)
    if (item.status !== 'SUBMITTED' && item.status !== 'DRAFT') {
      return delay(fail(40001, '当前状态不能撤销'), 100)
    }
    item.status = 'CANCELED'
    item.logs.push({
      status: 'CANCELED',
      label: '已撤销',
      time: nowText(),
      operator: '王秀兰',
      note: (body && body.reason) || '本人撤销申请'
    })
    return delay(envelope(applyDetail(item)), 150)
  }

  match = path.match(/^\/gov\/applies\/([^/]+)\/rate$/)
  if (match && method === 'POST') {
    const item = findApply(match[1])
    if (!item) return delay(fail(40402, '办件不存在'), 100)
    if (item.status !== 'COMPLETED' || item.rating) {
      return delay(fail(40001, '当前状态不能评价'), 100)
    }
    const score = Math.max(1, Math.min(5, Number(body.score || 5)))
    item.rating = {
      score: score,
      comment: String(body.comment || '').slice(0, 200),
      time: nowText()
    }
    item.logs.push({
      status: item.status,
      label: '已评价',
      time: item.rating.time,
      operator: '王秀兰',
      note: score + ' 星' + (item.rating.comment ? '：' + item.rating.comment : '')
    })
    return delay(envelope(applyDetail(item)), 160)
  }

  match = path.match(/^\/gov\/applies\/([^/]+)\/pay$/)
  if (match && method === 'POST') {
    return delay(fail(40004, '在线缴费将在 V2.1 开放，当前支持线下代收'), 100)
  }

  match = path.match(/^\/gov\/applies\/([^/]+)$/)
  if (match && method === 'GET') {
    const item = findApply(match[1])
    if (!item) return delay(fail(40402, '办件不存在'), 100)
    return delay(envelope(applyDetail(item)), 120)
  }
  return null
}

function requestTypeLabel(type) {
  return {
    consult: '咨询帮办',
    appeal: '诉求建议',
    suggestion: '意见建议'
  }[type] || '诉求建议'
}

function handleRequest(path, method, params, body, token) {
  if (path !== '/requests' && path.indexOf('/requests/') !== 0) return null
  if (!currentUser(token)) return delay(fail(20001, '请先登录'))
  if (path === '/requests' && method === 'GET') {
    const status = params.status || ''
    let list = runtime.requests.slice()
    if (status === 'processing') {
      list = list.filter(function (item) {
        return ['PENDING', 'ACCEPTED', 'PROCESSING'].indexOf(item.status) >= 0
      })
    } else if (status === 'done') {
      list = list.filter(function (item) {
        return ['COMPLETED', 'CLOSED', 'RATED'].indexOf(item.status) >= 0
      })
    } else if (status) {
      list = list.filter(function (item) {
        return item.status === status
      })
    }
    list.sort(function (a, b) {
      return String(b.createdAt).localeCompare(String(a.createdAt))
    })
    return delay(envelope({
      list: list.map(requestCard),
      total: list.length,
      page: 1,
      pageSize: list.length,
      hasMore: false
    }), 120)
  }

  if (path === '/requests' && method === 'POST') {
    const title = String(body.title || '').trim()
    const content = String(body.content || '').trim()
    if (!title) return delay(fail(40001, '请填写诉求标题'), 100)
    if (!content) return delay(fail(40001, '请描述具体情况'), 100)
    const type = ['consult', 'appeal', 'suggestion'].indexOf(body.type) >= 0 ? body.type : 'appeal'
    const d = new Date()
    const seq = ('0000' + (runtime.requests.length + 1)).slice(-4)
    const requestNo = 'QZ' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + seq
    const createdAt = nowText()
    const item = {
      id: 'rq' + Date.now(),
      requestNo: requestNo,
      type: type,
      typeLabel: requestTypeLabel(type),
      title: title,
      content: content,
      location: String(body.location || ''),
      contactPhone: String(body.contactPhone || ''),
      photos: body.photos || [],
      status: 'PENDING',
      createdAt: createdAt,
      rating: 0,
      logs: [{
        status: 'PENDING',
        label: '待受理',
        time: createdAt,
        operator: '王秀兰',
        note: '提交' + requestTypeLabel(type)
      }],
      replies: []
    }
    runtime.requests.unshift(item)
    return delay(envelope(requestDetail(item)), 260)
  }

  let match = path.match(/^\/requests\/([^/]+)\/rate$/)
  if (match && method === 'POST') {
    const item = findRequest(match[1])
    if (!item) return delay(fail(40402, '诉求不存在'), 100)
    if (item.status !== 'COMPLETED' || item.rating) {
      return delay(fail(40001, '当前状态不能评价'), 100)
    }
    const score = Math.max(1, Math.min(5, Number(body.score || 5)))
    item.rating = {
      score: score,
      comment: String(body.comment || '').slice(0, 200),
      time: nowText()
    }
    item.status = 'RATED'
    item.logs.push({
      status: 'RATED',
      label: '已评价',
      time: item.rating.time,
      operator: '王秀兰',
      note: score + ' 星' + (item.rating.comment ? '：' + item.rating.comment : '')
    })
    return delay(envelope(requestDetail(item)), 160)
  }

  match = path.match(/^\/requests\/([^/]+)\/urge$/)
  if (match && method === 'POST') {
    const item = findRequest(match[1])
    if (!item) return delay(fail(40402, '诉求不存在'), 100)
    if (item.status === 'COMPLETED' || item.status === 'RATED' || item.status === 'CLOSED') {
      return delay(fail(40001, '当前状态无需催办'), 100)
    }
    item.urgeCount = (item.urgeCount || 0) + 1
    item.logs.push({
      status: item.status,
      label: '催办提醒',
      time: nowText(),
      operator: '王秀兰',
      note: '第 ' + item.urgeCount + ' 次催办，请尽快处理'
    })
    return delay(envelope({
      urgeCount: item.urgeCount,
      message: '已提醒网格员'
    }), 120)
  }

  match = path.match(/^\/requests\/([^/]+)$/)
  if (match && method === 'GET') {
    const item = findRequest(match[1])
    if (!item) return delay(fail(40402, '诉求不存在'), 100)
    return delay(envelope(requestDetail(item)), 120)
  }
  return null
}

function handleService(path, method) {
  if (path === '/directory' && method === 'GET') {
    const categories = []
    data.serviceDirectory.forEach(function (item) {
      if (categories.indexOf(item.category) < 0) categories.push(item.category)
    })
    return delay(envelope({
      list: data.serviceDirectory,
      categories: categories
    }), 120)
  }
  if (path === '/jobs' && method === 'GET') {
    return delay(envelope({
      list: data.jobs,
      total: data.jobs.length
    }), 120)
  }
  if (path === '/tea-meetings' && method === 'GET') {
    return delay(envelope({
      list: data.teaMeetings,
      total: data.teaMeetings.length
    }), 120)
  }
  return null
}

function currentStats() {
  const completedUnratedApplies = runtime.applies.filter(function (item) {
    return item.status === 'COMPLETED' && !item.rating
  }).length
  const completedUnratedRequests = runtime.requests.filter(function (item) {
    return item.status === 'COMPLETED' && !item.rating
  }).length
  return {
    applies: runtime.applies.length,
    appeals: runtime.requests.length,
    ratings: completedUnratedApplies + completedUnratedRequests
  }
}

function handleArticles(path, params, method, body) {
  if (path === '/articles') {
    const columnId = params.columnId && params.columnId !== 'all' ? params.columnId : ''
    const page = Math.max(1, Number(params.page || 1))
    const pageSize = Math.max(1, Number(params.pageSize || 10))
    let list = sortedArticles()
    if (columnId) {
      list = list.filter(function (a) {
        return a.columnId === columnId
      })
    }
    const total = list.length
    const start = (page - 1) * pageSize
    return delay(envelope({
      list: list.slice(start, start + pageSize).map(card),
      total: total,
      page: page,
      pageSize: pageSize,
      hasMore: start + pageSize < total
    }))
  }

  let match = path.match(/^\/articles\/([^/]+)\/like$/)
  if (match && method === 'POST') {
    const id = match[1]
    const article = getArticle(id)
    if (!article) return delay(fail(40401, '文章不存在或已下线'))
    const current = !!runtime.liked[id]
    const liked = body && typeof body.liked === 'boolean' ? body.liked : !current
    if (liked !== current) {
      runtime.liked[id] = liked
      const base = runtime.likes[id] || article.likes
      runtime.likes[id] = Math.max(0, base + (liked ? 1 : -1))
    }
    return delay(envelope({
      liked: !!runtime.liked[id],
      likes: runtime.likes[id] || article.likes
    }), 120)
  }

  match = path.match(/^\/articles\/([^/]+)$/)
  if (match && method === 'GET') {
    const id = match[1]
    const article = getArticle(id)
    if (!article) return delay(fail(40401, '文章不存在或已下线'))
    runtime.views[id] = (runtime.views[id] || article.views) + 1
    const column = data.columns.filter(function (c) {
      return c.id === article.columnId
    })[0] || {}
    const sameColumn = sortedArticles().filter(function (a) {
      return a.columnId === article.columnId
    })
    const index = sameColumn.findIndex(function (a) {
      return a.id === id
    })
    const prev = index > 0 ? sameColumn[index - 1] : null
    const next = index >= 0 && index < sameColumn.length - 1 ? sameColumn[index + 1] : null
    return delay(envelope({
      id: article.id,
      columnId: article.columnId,
      columnName: column.name,
      columnColor: column.color,
      title: article.title,
      summary: article.summary,
      content: article.content,
      isTop: article.isTop,
      publishedAt: article.publishedAt,
      displayDate: format.fullDate(article.publishedAt),
      views: runtime.views[id],
      likes: runtime.likes[id] || article.likes,
      liked: !!runtime.liked[id],
      source: article.source,
      author: article.author,
      prev: prev ? {
        id: prev.id,
        title: prev.title
      } : null,
      next: next ? {
        id: next.id,
        title: next.title
      } : null
    }))
  }
  return null
}

function handleGov(path, params, method) {
  if (path === '/gov/categories') {
    const list = data.govCategories.map(function (c) {
      return Object.assign({}, c, {
        count: c.id === 'all' ? data.govItems.length : data.govItems.filter(function (i) {
          return i.categoryId === c.id
        }).length
      })
    })
    return delay(envelope({
      list: list,
      total: data.govItems.length
    }))
  }
  if (path === '/gov/items') {
    const categoryId = params.categoryId && params.categoryId !== 'all' ? params.categoryId : ''
    const keyword = String(params.keyword || '').trim()
    let list = data.govItems.slice()
    if (categoryId) {
      list = list.filter(function (i) {
        return i.categoryId === categoryId
      })
    }
    if (keyword) {
      list = list.filter(function (i) {
        return (i.name + i.shortName + i.summary + i.tags.join('')).indexOf(keyword) >= 0
      })
    }
    return delay(envelope({
      list: list.map(function (i) {
        return {
          id: i.id,
          code: i.code,
          categoryId: i.categoryId,
          categoryName: i.categoryName,
          name: i.name,
          shortName: i.shortName,
          summary: i.summary,
          icon: i.icon,
          iconTint: i.iconTint,
          tags: i.tags,
          promiseDays: i.promiseDays,
          fee: i.fee
        }
      }),
      total: list.length,
      categoryId: categoryId || 'all',
      keyword: keyword
    }))
  }
  const match = path.match(/^\/gov\/items\/([^/]+)$/)
  if (match && method === 'GET') {
    const code = match[1]
    const item = data.govItems.filter(function (i) {
      return i.code === code
    })[0]
    if (!item) return delay(fail(40402, '事项不存在或已下线'))
    return delay(envelope(item))
  }
  return null
}

function handleUser(path, method, body, token) {
  const user = currentUser(token)
  if (path === '/users/me' && method === 'GET') {
    if (!user) return delay(fail(20001, '请先登录'))
    return delay(envelope({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      roleCode: user.roleCode,
      roleName: user.roleName,
      phoneDisplay: user.phoneDisplay,
      avatarText: user.avatarText,
      avatarUrl: user.avatarUrl || '',
      regionId: user.regionId,
      regionName: user.regionName,
      gridName: user.gridName,
      regionPath: user.regionPath,
      houseNo: user.houseNo,
      joinedAt: user.joinedAt,
      isVerified: user.isVerified,
      stats: currentStats(),
      gridWorker: data.village.gridWorker
    }))
  }
  if (path === '/users/me' && method === 'PUT') {
    if (!user) return delay(fail(20001, '请先登录'))
    const next = Object.assign({}, user)
    if (body && body.nickname) {
      next.nickname = String(body.nickname).slice(0, 20)
      data.user.nickname = next.nickname
    }
    if (body && body.avatarUrl !== undefined) {
      next.avatarUrl = body.avatarUrl
      data.user.avatarUrl = body.avatarUrl
    }
    return delay(envelope(next))
  }
  return null
}

function handleAI(path, method, body) {
  if (path === '/ai/suggestions') {
    return delay(envelope({
      list: data.suggestions,
      welcome: data.appConfig.aiWelcome,
      disclaimer: data.appConfig.aiDisclaimer
    }))
  }
  if (path === '/ai/chat' && method === 'POST') {
    const question = String(body.question || '').trim()
    if (!question) return delay(fail(40001, '请输入您的问题'))
    const result = ai.answerFor(question)
    const messageId = 'm' + Date.now()
    return delay(envelope({
      conversationId: body.conversationId || 'cv' + Date.now(),
      messageId: messageId,
      question: question,
      answer: result.answer,
      refs: result.refs,
      followUps: result.followUps,
      latencyMs: 860
    }), 300)
  }
  let match = path.match(/^\/ai\/messages\/([^/]+)\/feedback$/)
  if (match && method === 'POST') {
    return delay(envelope({
      messageId: match[1],
      feedback: body.feedback || 'up'
    }), 100)
  }
  match = path.match(/^\/ai\/conversations\/([^/]+)\/messages$/)
  if (match && method === 'GET') {
    return delay(envelope({
      conversationId: match[1],
      list: [],
      total: 0,
      page: 1,
      pageSize: 20
    }), 100)
  }
  match = path.match(/^\/ai\/conversations\/([^/]+)$/)
  if (match && method === 'DELETE') {
    runtime.conversations = runtime.conversations.filter(function (c) {
      return c.id !== match[1]
    })
    return delay(envelope(true), 100)
  }
  if (path === '/ai/conversations' && method === 'GET') {
    return delay(envelope({
      list: runtime.conversations,
      total: runtime.conversations.length
    }))
  }
  return null
}

function handleMisc(path, method, params, body) {
  if (path === '/app/config') {
    return delay(envelope(data.appConfig), 80)
  }
  if (path === '/columns') {
    return delay(envelope({
      list: data.columns
    }), 100)
  }
  if (path === '/modules') {
    return delay(envelope({
      list: data.modules
    }), 100)
  }
  if (path === '/regions/tree') {
    return delay(envelope({
      tree: data.regionTree,
      currentId: data.village.id
    }), 100)
  }
  const dictMatch = path.match(/^\/dicts\/([^/]+)$/)
  if (dictMatch) {
    return delay(envelope({
      type: dictMatch[1],
      list: data.dicts[dictMatch[1]] || []
    }), 60)
  }
  if (path === '/events' && method === 'POST') {
    // 埋点仅做控制台留痕，方便联调
    if (typeof console !== 'undefined') {
      console.log('[event]', body && body.eventCode, body && body.payload)
    }
    return delay(envelope(true), 30)
  }
  if (path === '/files' && method === 'POST') {
    return delay(envelope({
      id: 'f' + Date.now(),
      url: 'https://example.com/mock/' + Date.now() + '.jpg',
      name: (body && body.name) || 'upload.jpg'
    }), 200)
  }
  if (path.indexOf('/workbench') === 0) {
    return delay(fail(40004, '网格员工作台将在 V3 版本开放'), 120)
  }
  if (path.indexOf('/users/family') === 0 || path.indexOf('/ai/agent') === 0) {
    return delay(fail(40004, '该能力将在 V3 版本开放'), 120)
  }
  if (path === '/share/track' || path === '/points') {
    return delay(fail(40004, '该能力将在 V4 版本开放'), 120)
  }
  return null
}

function handle(options) {
  const path = options.url
  const method = (options.method || 'GET').toUpperCase()
  const params = options.params || {}
  const body = options.data || {}
  const token = options.token || ''

  const handlers = [
    function () {
      return handleAuth(path, method, params, body)
    },
    function () {
      if (path === '/home' && method === 'GET') return handleHome()
      return null
    },
    function () {
      return handleArticles(path, params, method, body)
    },
    function () {
      return handleGov(path, params, method)
    },
    function () {
      return handleApply(path, method, params, body, token)
    },
    function () {
      return handleRequest(path, method, params, body, token)
    },
    function () {
      return handleService(path, method)
    },
    function () {
      return handleAI(path, method, body)
    },
    function () {
      return handleUser(path, method, body, token)
    },
    function () {
      return handleMisc(path, method, params, body)
    }
  ]

  for (let i = 0; i < handlers.length; i += 1) {
    const result = handlers[i]()
    if (result) return result
  }

  console.warn('[mock] 未匹配接口', method, path)
  return delay(fail(40400, '接口不存在：' + method + ' ' + path), 60)
}

module.exports = {
  handle: handle
}
