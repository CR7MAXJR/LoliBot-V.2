import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (m.fromMe) return
  if (!/^https?:\/\//.test(text)) return m.reply(`📌 مثال:\n${usedPrefix + command} https://skyultraplus.com`)
  
  m.react("💻")
  
  let url = text
  let res = await fetch(url)

  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    throw `📦 الحجم كبير جدًا:\nContent-Length: ${res.headers.get('content-length')}`
  }

  if (!/text|json/.test(res.headers.get('content-type')))
    return conn.sendFile(m.chat, url, 'file', text, m)

  let txt = await res.buffer()

  try {
    txt = format(JSON.parse(txt + ''))
  } catch (e) {
    txt = txt + ''
  } finally {
    m.reply(txt.slice(0, 65536) + '')
  }
}

handler.help = ['جلب *<رابط>*']
handler.tags = ['المالك']
handler.command = /^جلب$/i
handler.register = true

export default handler
