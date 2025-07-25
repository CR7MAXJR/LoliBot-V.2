import { webp2png } from '../lib/webp2mp4.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import axios from 'axios'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OWNER1 = "573226873710@s.whatsapp.net"
const ACTIVE_CONVERSATIONS = {}
const MAX_VIDEO_SIZE_MB = 60

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
  if (!text) return m.reply(`⚠️ يرجى كتابة وصف الخطأ أو المشكلة\n\n📌 *مثال:* ${usedPrefix + command} الملصقات لا تعمل`)
  if (text.length < 8) return m.reply(`📏 *الحد الأدنى هو 10 أحرف لإرسال البلاغ*`)
  if (text.length > 1000) return m.reply(`📛 *الحد الأقصى 1000 حرف للبلاغ*`)

  let teks = `┏━━━━━━ ⧼ بلاغ جديد ⧽ ━━━━━━┓
┃📞 *رقم المستخدم:* wa.me/${m.sender.split`@`[0]}
┃💬 *البلاغ:* ${text}
┗━━━━━━━━━━━━━━━━━━━━┛`

  await delay(1000)
  await conn.reply(m.chat, `✅ تم إرسال بلاغك إلى المطور.\n🕐 ستصلك إجابة في أقرب وقت ممكن.\n🚫 البلاغات الكاذبة سيتم تجاهلها.`, m, {
    contextInfo: {
      externalAdReply: {
        mediaUrl: null,
        mediaType: 1,
        description: null,
        body: 'تم إرسال البلاغ بنجاح',
        previewType: 0,
        thumbnail: m.pp,
        sourceUrl: [info.md, info.yt, info.tiktok].getRandom()
      }
    }
  })

  await delay(3000)
  await conn.reply(OWNER1, m.quoted ? teks + m.quoted.text : teks, null, {
    contextInfo: {
      mentionedJid: [m.sender]
    }
  })
}

handler.help = ['بلاغ <النص>']
handler.tags = ['عام']
handler.command = /^(بلاغ|بلاغ-المطور|بلاغ-المالك|ابلاغ|تبليغ|ابلاغ-عن-مشكلة)$/i
handler.register = true
export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
