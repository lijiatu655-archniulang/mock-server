const store = {}
let redirected = ''
global.wx = {
  getStorageSync: k => (store[k] === undefined ? '' : store[k]),
  setStorageSync: (k, v) => { store[k] = v },
  removeStorageSync: k => { delete store[k] },
  showToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  navigateTo: () => {},
  redirectTo: o => { redirected = o.url },
  setNavigationBarTitle: () => {},
  showActionSheet: () => {},
  chooseMedia: () => {}
}
global.Page = o => { global.page = o }
require('../../cilent/pages/request/create.js')

function setDeep(root, path, value) {
  const m = path.match(/^([A-Za-z_$][\w$]*)\[(\d+)\]\.([A-Za-z_$][\w$]*)$/)
  if (m) {
    root[m[1]][Number(m[2])][m[3]] = value
    return
  }
  root[path] = value
}
page.setData = function (patch, cb) {
  Object.keys(patch).forEach(k => setDeep(this.data, k, patch[k]))
  if (cb) cb()
}

const auth = require('../../cilent/api/auth')

;(async () => {
  await auth.mockLogin()
  page.onLoad({ type: 'appeal' })
  page.onInput({ currentTarget: { dataset: { field: 'title' } }, detail: { value: '测试：三组路灯不亮' } })
  page.onInput({ currentTarget: { dataset: { field: 'content' } }, detail: { value: '三组路灯坏了好几天，晚上出门看不见，希望尽快维修。' } })
  page.onInput({ currentTarget: { dataset: { field: 'location' } }, detail: { value: '三组 26 号' } })
  page.onSubmit()
  await new Promise(r => setTimeout(r, 1000))
  console.log('error', page.data.error, 'redirected', redirected)
  if (!redirected) process.exit(1)
})()
