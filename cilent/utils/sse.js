/**
 * 小程序端 SSE 工具
 * 小程序没有 EventSource，使用 wx.request({ enableChunked: true }) + onChunkReceived
 * 需要处理：UTF-8 解码、粘包/半包、多行 data、事件名
 */

function decodeUtf8(buffer) {
  return decodeBytes(new Uint8Array(buffer)).text
}

/**
 * 有状态解码器：网络 chunk 可能把中文字符切成两半，必须保留未完成的尾字节
 * 用法：const decode = createDecoder(); buffer += decode(chunkArrayBuffer)
 */
function createDecoder() {
  let pending = new Uint8Array(0)
  return function (buffer) {
    const incoming = new Uint8Array(buffer)
    const bytes = new Uint8Array(pending.length + incoming.length)
    bytes.set(pending, 0)
    bytes.set(incoming, pending.length)
    const result = decodeBytes(bytes)
    pending = result.pending
    return result.text
  }
}

/**
 * 解码完整字节，返回 { text, pending }；pending 为末尾不完整的多字节序列
 */
function decodeBytes(bytes) {
  let text = ''
  let i = 0
  while (i < bytes.length) {
    const b0 = bytes[i]
    let need = 0
    if (b0 < 0x80) {
      text += String.fromCharCode(b0)
      i += 1
      continue
    } else if (b0 >= 0xc2 && b0 <= 0xdf) {
      need = 2
    } else if (b0 >= 0xe0 && b0 <= 0xef) {
      need = 3
    } else if (b0 >= 0xf0 && b0 <= 0xf4) {
      need = 4
    } else {
      // 非法起始字节，跳过，避免整段文本卡死
      i += 1
      continue
    }
    if (i + need > bytes.length) {
      return { text: text, pending: bytes.slice(i) }
    }
    const b1 = bytes[i + 1]
    if (need === 2) {
      text += String.fromCharCode(((b0 & 0x1f) << 6) | (b1 & 0x3f))
    } else if (need === 3) {
      text += String.fromCharCode(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (bytes[i + 2] & 0x3f))
    } else {
      let cp = ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f)
      cp -= 0x10000
      text += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff))
    }
    i += need
  }
  return { text: text, pending: new Uint8Array(0) }
}

/**
 * 解析 SSE 流：把 chunk 累积后按空行切事件
 * @param {string} buffer 已累积文本
 * @param {Function} onEvent (eventName, dataObject) => void
 * @returns {string} 剩余未消费的 buffer
 */
function consume(buffer, onEvent) {
  let text = buffer || ''
  let index = text.indexOf('\n\n')
  // 兼容 \r\n\r\n
  const indexR = text.indexOf('\r\n\r\n')
  if (index < 0 || (indexR >= 0 && indexR < index)) index = indexR
  if (index < 0) return text

  const sep = text.slice(index, index + 2) === '\r\n' ? 4 : 2
  const raw = text.slice(0, index)
  const rest = text.slice(index + sep)
  let eventName = 'message'
  const dataLines = []
  raw.split(/\r?\n/).forEach(function (line) {
    if (!line || line.charAt(0) === ':') return
    const colon = line.indexOf(':')
    const field = colon < 0 ? line : line.slice(0, colon)
    let value = colon < 0 ? '' : line.slice(colon + 1)
    if (value.charAt(0) === ' ') value = value.slice(1)
    if (field === 'event') eventName = value
    else if (field === 'data') dataLines.push(value)
  })
  if (dataLines.length) {
    const dataText = dataLines.join('\n')
    let payload = dataText
    try {
      payload = JSON.parse(dataText)
    } catch (e) {
      // 非 JSON 也原样回调，便于兜底
    }
    onEvent(eventName, payload)
  }
  return consume(rest, onEvent)
}

module.exports = {
  decodeUtf8,
  createDecoder,
  consume
}
