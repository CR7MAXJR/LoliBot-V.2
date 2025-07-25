import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

// 🟢 تعريب وتبسيط أسماء الأوامر والنصوص
const actions = {
  لحس:      { e: '👅', v: 'لحس', nsfw: false, aliases: [] },
  عض:       { e: '🧛‍♂️', v: 'عض', nsfw: false, aliases: [] },
  احمرار:   { e: '😳', v: 'احمر خجلًا مع', nsfw: false, aliases: [] },
  عناق:     { e: '🥰', v: 'تعانق مع', nsfw: false, aliases: [] },
  يد_بيد:   { e: '🤝', v: 'أمسك يد', nsfw: false, aliases: [] },
  تصفيق:    { e: '✋', v: 'صفق مع', nsfw: false, aliases: [] },
  نكز:      { e: '👉', v: 'نكز', nsfw: false, aliases: [] },
  ابتسم:    { e: '😊', v: 'ابتسم لـ', nsfw: false, aliases: [] },
  لوح:      { e: '👋', v: 'لوح لـ', nsfw: false, aliases: [] },
  اطعمه:    { e: '🍪', v: 'أطعم', nsfw: false, aliases: [] },
  رقص:      { e: '💃', v: 'رقص مع', nsfw: false, aliases: [] },
  غمز:      { e: '😉', v: 'غمز لـ', nsfw: false, aliases: [] },
  فرح:      { e: '😁', v: 'فرح مع', nsfw: false, aliases: [] },
  متكبر:    { e: '😏', v: 'نظر بتكبر إلى', nsfw: false, aliases: [] },
  مص:       { e: '😳', v: 'قام بفعل خادش لـ', nsfw: true, aliases: ['اورال'] }
}

const actionByCommand = Object.entries(actions).reduce((map, [k, v]) => {
  map[k] = { ...v, main: k }
  if (v.aliases) for (const a of v.aliases) map[a] = { ...v, main: k }
  return map
}, {})

let handler = async (m, { conn, command }) => {
  try {
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender)
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender)

    const getName = async jid => (await conn.getName(jid).catch(() => null)) || `+${jid.split('@')[0]}`
    const senderName = await getName(m.sender)
    const mentionedNames = await Promise.all(m.mentionedJid.map(async u => u === m.sender ? 'نفسه' : await getName(u)))

    const act = actionByCommand[command.toLowerCase()] || { e: '✨', v: 'فعل شيئًا مع', nsfw: false, main: command.toLowerCase() }
    const texto = `${act.e} ${senderName} ${act.v} ${mentionedNames.join(', ')}`
    const tipo = act.nsfw ? 'nsfw' : 'sfw'
    const endpoint = act.main
    const { url } = await fetch(`https://api.waifu.pics/${tipo}/${endpoint}`).then(r => r.json())

    let stiker
    try {
      stiker = await sticker(null, url, texto)
    } catch {}

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: texto,
            body: '',
            mediaType: 2,
            sourceUrl: '',
            thumbnail: m.pp
          }
        }
      }, { quoted: m })
      return
    }

    const gifBuffer = await fetch(url).then(r => r.buffer())
    await conn.sendMessage(m.chat, { video: gifBuffer, gifPlayback: true, caption: texto, mentions: m.mentionedJid }, { quoted: m })

  } catch (e) {
    console.error(`[❌ خطأ في الأمر ${command}]`, e)
    await conn.reply(m.chat, `❌ حدث خطأ أثناء تنفيذ *${command}*.`, m)
  }
}

// أوامر المساعدة والأسماء المدعومة
handler.help    = Object.keys(actions).flatMap(k => [k, ...(actions[k].aliases || [])])
handler.tags    = ['sticker']
handler.command = new RegExp(`^(${Object.keys(actionByCommand).join('|')})$`, 'i')
handler.register = true

export default handler
