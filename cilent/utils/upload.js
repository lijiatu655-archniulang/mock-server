const config = require('./config')
const storage = require('./storage')

/**
 * 文件上传：真实环境走 POST /files（multipart），Mock 环境直接用本地临时路径
 * 返回 Promise<{ id, url, name }>
 */
function uploadFile(filePath, bizType, name) {
  if (!filePath) return Promise.reject(new Error('未选择文件'))
  if (config.USE_MOCK) {
    return Promise.resolve({
      id: 'local_' + Date.now(),
      url: filePath,
      name: name || 'local.jpg'
    })
  }
  return new Promise(function (resolve, reject) {
    const token = storage.getToken()
    wx.uploadFile({
      url: config.BASE_URL + '/files',
      filePath: filePath,
      name: 'file',
      formData: {
        bizType: bizType || 'avatar'
      },
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success: function (res) {
        try {
          const body = JSON.parse(res.data || '{}')
          if (body.code !== 0) {
            reject(new Error(body.message || '上传失败'))
            return
          }
          resolve(body.data)
        } catch (e) {
          reject(new Error('上传返回格式错误'))
        }
      },
      fail: function () {
        reject(new Error('上传失败，请检查网络'))
      }
    })
  })
}

module.exports = {
  uploadFile: uploadFile
}
