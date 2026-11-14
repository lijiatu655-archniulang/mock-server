/**
 * V3 / V4 预留接口（V2 用户端已实现，不再放在这里）
 *
 * 设计原则：先留调用位，功能上线后只换实现，不改页面。
 * Mock 环境统一返回 code=40004（能力未开放）。
 *
 * 对应契约：temp/接口契约-v1.md 第 9.3 / 9.4 节
 */
const request = require('../utils/request')

/* 网格员工作台（V3） */
const workbench = {
  summary() {
    return request.get('/workbench/summary')
  },
  applies(params) {
    return request.get('/workbench/applies', params || {})
  },
  requests(params) {
    return request.get('/workbench/requests', params || {})
  },
  createVisit(data) {
    return request.post('/workbench/visits', data || {})
  },
  visits(params) {
    return request.get('/workbench/visits', params || {})
  },
  reportEvent(data) {
    return request.post('/workbench/events', data || {})
  },
  transferEvent(id, data) {
    return request.post('/workbench/events/' + id + '/transfer', data || {})
  }
}

/* 家庭成员（V3） */
const family = {
  list() {
    return request.get('/users/family')
  },
  bind(data) {
    return request.post('/users/family', data || {})
  }
}

/* AI Agent（V3） */
const agent = {
  exec(data) {
    return request.post('/ai/agent/exec', data || {})
  }
}

/* 分享 / 积分（V4） */
const share = {
  track(data) {
    return request.post('/share/track', data || {})
  }
}

const points = {
  get() {
    return request.get('/points')
  }
}

module.exports = {
  workbench: workbench,
  family: family,
  agent: agent,
  share: share,
  points: points
}
