const config = require('./config')
const i18n = require('./i18n')

const KEY = (config.STORAGE && config.STORAGE.TTS) || 'xct_tts'
const MAX_CHARS = 110
const PLUGIN_PROVIDER = 'wx069ba97219f66d99'

let audio = null
let chunks = []
let cursor = 0
let playing = false
let listeners = []
let lastErrorAt = 0
let pluginRef
let pluginChecked = false

function isOn() {
  try {
    const value = wx.getStorageSync(KEY)
    return value === true || value === 'on'
  } catch (e) {
    return false
  }
}

function setOn(on) {
  try {
    wx.setStorageSync(KEY, !!on)
  } catch (e) {}
  if (!on) stop()
  return !!on
}

function toggle() {
  return setOn(!isOn())
}

function subscribe(fn) {
  if (typeof fn === 'function') listeners.push(fn)
}

function emit(state) {
  listeners.forEach(function (fn) {
    try {
      fn(state)
    } catch (e) {}
  })
}

/** 去掉 markdown、引用标记和多余空白，避免把符号念出来 */
function clean(text) {
  let s = String(text || '')
  s = s.replace(/```[\s\S]*?```/g, ' ')
  s = s.replace(/[#>*_`~]/g, ' ')
  s = s.replace(/\[(.*?)\]\(.*?\)/g, '$1')
  s = s.replace(/（依据[:：][^）]*）/g, ' ')
  s = s.replace(/\(依据[:：][^)]*\)/g, ' ')
  s = s.replace(/\s+/g, ' ')
  return s.trim()
}

/** 按标点切句，单段不超过 MAX_CHARS */
function split(text) {
  const s = clean(text)
  if (!s) return []
  const parts = s.split(/(?<=[。！？；!?;\n])/)
  const out = []
  let current = ''
  parts.forEach(function (part) {
    const piece = part.trim()
    if (!piece) return
    if ((current + piece).length <= MAX_CHARS) {
      current += piece
      return
    }
    if (current) out.push(current)
    if (piece.length <= MAX_CHARS) {
      current = piece
      return
    }
    let rest = piece
    while (rest.length > MAX_CHARS) {
      out.push(rest.slice(0, MAX_CHARS))
      rest = rest.slice(MAX_CHARS)
    }
    current = rest
  })
  if (current) out.push(current)
  return out
}

/** 微信同声传译插件：懒加载，未授权时静默降级 */
function getPlugin() {
  if (pluginChecked) return pluginRef
  pluginChecked = true
  pluginRef = null
  try {
    if (typeof requirePlugin === 'function') {
      const p = requirePlugin('WechatSI')
      if (p && typeof p.textToSpeech === 'function') pluginRef = p
    }
  } catch (e) {
    pluginRef = null
  }
  return pluginRef
}

function backendUrl(text, lang) {
  const base = (config.TTS_URL && String(config.TTS_URL).trim()) || (config.BASE_URL + '/ai/tts')
  const joiner = base.indexOf('?') >= 0 ? '&' : '?'
  return base + joiner +
    'text=' + encodeURIComponent(text) +
    '&lang=' + encodeURIComponent(lang || 'zh')
}

/** 取一段文本的可播放地址：插件优先，插件不可用再走后端 */
function resolveSrc(text, lang) {
  return new Promise(function (resolve) {
    const p = getPlugin()
    if (!p) {
      resolve(backendUrl(text, lang))
      return
    }
    let settled = false
    const fallback = function () {
      if (settled) return
      settled = true
      resolve(backendUrl(text, lang))
    }
    const timer = setTimeout(fallback, 6000)
    try {
      p.textToSpeech({
        lang: lang === 'ko' ? 'ko_KR' : 'zh_CN',
        tts: true,
        content: text,
        success: function (res) {
          clearTimeout(timer)
          if (settled) return
          settled = true
          resolve(res && res.filename ? res.filename : backendUrl(text, lang))
        },
        fail: function () {
          clearTimeout(timer)
          fallback()
        }
      })
    } catch (e) {
      clearTimeout(timer)
      fallback()
    }
  })
}

function notifyError() {
  const now = Date.now()
  if (now - lastErrorAt < 8000) return
  lastErrorAt = now
  emit({ speaking: false, error: true })
  try {
    wx.showToast({
      title: i18n.getLang() === 'ko'
        ? '음성 읽기를 사용할 수 없습니다'
        : '语音朗读暂不可用',
      icon: 'none',
      duration: 2200
    })
  } catch (e) {}
}

function finish() {
  playing = false
  chunks = []
  cursor = 0
  emit({ speaking: false })
}

function playAt(index, lang) {
  if (!playing || index >= chunks.length) {
    finish()
    return
  }
  cursor = index
  resolveSrc(chunks[index], lang).then(function (src) {
    if (!playing) return
    if (!wx.createInnerAudioContext) {
      notifyError()
      finish()
      return
    }
    if (!audio) {
      audio = wx.createInnerAudioContext()
      audio.obeyMuteSwitch = false
    }
    audio.offEnded && audio.offEnded()
    audio.offError && audio.offError()
    audio.onEnded(function () {
      playAt(index + 1, lang)
    })
    audio.onError(function () {
      notifyError()
      finish()
    })
    audio.src = src
    try {
      audio.play()
    } catch (e) {
      notifyError()
      finish()
    }
  })
}

function speak(text, options) {
  const opts = options || {}
  const list = split(text)
  if (!list.length) return false
  stop()
  const lang = opts.lang || i18n.getLang()
  chunks = list
  cursor = 0
  playing = true
  emit({ speaking: true })
  playAt(0, lang)
  return true
}

function stop() {
  chunks = []
  cursor = 0
  playing = false
  if (audio) {
    try {
      audio.stop()
    } catch (e) {}
  }
  emit({ speaking: false })
}

function isSpeaking() {
  return playing
}

function hasPlugin() {
  return !!getPlugin()
}

module.exports = {
  isOn: isOn,
  setOn: setOn,
  toggle: toggle,
  speak: speak,
  stop: stop,
  isSpeaking: isSpeaking,
  hasPlugin: hasPlugin,
  subscribe: subscribe,
  clean: clean,
  split: split,
  PLUGIN_PROVIDER: PLUGIN_PROVIDER
}