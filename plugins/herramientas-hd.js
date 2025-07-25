import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ""
    if (!mime.startsWith('image')) return m.reply(`⚠️ *الرجاء الرد على صورة لتحسين جودتها إلى HD.*`)
    await m.react('⌛')
    
    let img = await q.download?.()
    if (!img) return m.reply(`❌ لم أتمكن من تحميل الصورة.`)
    let url = await uploadImage(img)
    let res = await fetch(`https://api.neoxr.eu/api/remini?image=${encodeURIComponent(url)}&apikey=GataDios`)
    let json = await res.json()
    if (!json.status || !json.data?.url) return m.reply('❌ لم أتمكن من تحسين الصورة.')
    
    await conn.sendFile(m.chat, json.data.url, 'hd.jpg', `✅ *تم تحسين الصورة إلى جودة عالية (HD)*`, m)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ خطأ: ${e.message || e}`)
  }
}

handler.help = ['تحسين', 'hd']
handler.tags = ['tools']
handler.command = ['تحسين', 'hd'] // يمكنك إضافة المزيد مثل ['تحسين', 'hd', 'جودة', 'remini']
handler.register = true
handler.limit = 1

export default handler
