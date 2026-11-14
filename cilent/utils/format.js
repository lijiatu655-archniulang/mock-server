const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function pad(n) {
  return n < 10 ? '0' + n : String(n)
}

/** '2026-11-12 09:00' -> Date */
function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const text = String(value).replace(/-/g, '/')
  const d = new Date(text)
  return isNaN(d.getTime()) ? null : d
}

/** 列表用：今天 / 昨天 / 11-12 */
function friendlyDate(value) {
  const d = toDate(value)
  if (!d) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return '今天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  const yesterday = new Date(now.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return '昨天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  if (d.getFullYear() === now.getFullYear()) return pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** 详情用：2026年11月12日 09:00 */
function fullDate(value) {
  const d = toDate(value)
  if (!d) return ''
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function weekDay(value) {
  const d = toDate(value)
  return d ? '星期' + WEEK[d.getDay()] : ''
}

function maskPhone(phone) {
  const text = String(phone || '')
  if (text.length < 7) return text
  return text.slice(0, 3) + '****' + text.slice(-4)
}

function numberText(n) {
  const num = Number(n || 0)
  if (num >= 10000) return (num / 10000).toFixed(1).replace('.0', '') + '万'
  return String(num)
}

function query(params) {
  if (!params) return ''
  const parts = []
  Object.keys(params).forEach(function (key) {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })
  return parts.join('&')
}

module.exports = {
  pad,
  friendlyDate,
  fullDate,
  weekDay,
  maskPhone,
  numberText,
  query
}
