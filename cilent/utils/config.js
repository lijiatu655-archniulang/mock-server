/**
 * 全局配置（前后端分离开关）
 * USE_MOCK = true  ：小程序内置 Mock 数据，不依赖后端即可完整演示（推荐省赛现场）
 * USE_MOCK = false ：走真实 HTTP 接口，地址见 BASE_URL，接口契约见 temp/接口契约-v1.md
 */
const config = {
  APP_VERSION: '1.1.0',
  CLIENT: 'wx-miniprogram',
  USE_MOCK: true,
  BASE_URL: 'http://127.0.0.1:3000/api/v1',
  TIMEOUT: 15000,
  REGION_ID: '65402510001',
  // 演示环境自动以种子用户登录，对应 POST /auth/mock-login
  AUTO_MOCK_LOGIN: true,
  STORAGE: {
    TOKEN: 'xct_token',
    USER: 'xct_user',
    LIKED: 'xct_liked',
    AI_HISTORY: 'xct_ai_history',
    AI_SESSIONS: 'xct_ai_sessions',
    PENDING_Q: 'xct_pending_q',
    PENDING_SESSION: 'xct_pending_session'
  }
}

module.exports = config
