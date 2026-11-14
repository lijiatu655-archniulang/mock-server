/**
 * 全局配置（前后端分离开关）
 * USE_MOCK = true  ：小程序内置 Mock 数据，不依赖后端即可完整演示（推荐省赛现场）
 * USE_MOCK = false ：走真实 HTTP 接口，地址见 BASE_URL，接口契约见 temp/接口契约-v1.md
 */
const config = {
  APP_VERSION: '2.0.0',
  CLIENT: 'wx-miniprogram',
  USE_MOCK: false,
  BASE_URL: 'http://127.0.0.1:8080/api/v1',
  TIMEOUT: 15000,
  REGION_ID: '22022110001',
  // 关闭静默自动登录：由登录页手动选择微信或账号密码
  AUTO_MOCK_LOGIN: false,
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
