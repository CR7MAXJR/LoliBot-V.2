import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(m.mentionedJid.map(getName))

    const texto = `🤗 ${senderName} عانق ${mentionedNames.join('، ')} بكل حب`
    const { url: gifUrl } = await fetch('https://api.waifu.pics/sfw/hug').then(r => r.json())

    let stiker
    try {
      stiker = await sticker(null, gifUrl, texto)
    } catch (e) {
      console.error('❌ حدث خطأ أثناء إنشاء الملصق:', e)
    }

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: texto,
            body: info.wm,
            mediaType: 2,
            sourceUrl: info.md,
            thumbnail: m.pp
          }
        }
      }, { quoted: m })
      return
    }

    const gifBuffer = await fetch(gifUrl).then(r => r.buffer())
    await conn.sendMessage(m.chat, {
      video: gifBuffer,
      gifPlayback: true,
      caption: texto,
      mentions: m.mentionedJid
    }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    m.react("❌️")
  }
}

handler.help = ['عناق']
handler.tags = ['sticker']
handler.command = /^(hug|عناق|عنق|حضن)$/i  // يدعم عدة صيغ للأمر
handler.register = true

export default handler
