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
  showModal: o => { if (o.success) o.success({ confirm: true }) },
  makePhoneCall: () => {},
  chooseMedia: () => {}
}
global.Page = o => { global.page = o }
require('../../cilent/pages/gov/apply.js')

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
  page.onLoad({ code: 'YB001' })
  await new Promise(r => setTimeout(r, 600))
  console.log('item', page.data.item.shortName, 'fields', page.data.fields.length)
  page.data.fields.forEach((field, index) => {
    let value = '测试内容'
    if (field.type === 'idcard') value = '654025199001011111'
    if (field.type === 'date') value = '1990-01-01'
    if (field.type === 'select') value = field.options[0]
    if (field.type === 'radio') value = field.options[0]
    page.onFieldInput({ currentTarget: { dataset: { index: index } }, detail: { value: value } })
  })
  page.onAgreeTap()
  page.onSubmit()
  await new Promise(r => setTimeout(r, 1200))
  console.log('formError', page.data.formError, 'redirected', redirected)
  if (!redirected) process.exit(1)
})()
