import { createHash } from 'crypto'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

const formatPhoneNumber = (jid) => {
  if (!jid) return 'غير معروف';
  const number = jid.replace('@s.whatsapp.net', '');
  if (!/^\d{8,15}$/.test(number)) return 'غير معروف';
  return `+${number}`;
};

let handler = async (m, { conn }) => {
  let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user?.jid : m.sender)

  const userResult = await m.db.query('SELECT * FROM usuarios WHERE id = $1', [who])
  const user = userResult.rows[0]
  const bio = await conn.fetchStatus(who).catch(() => ({}))
  const biot = bio.status || 'لا توجد معلومات'
  const profilePic = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/9d38415096b6c46bf03f8.jpg')
  const buffer = await (await fetch(profilePic)).buffer()
  const { exp, limite, nombre, registered, edad, level, marry } = user
  const { min, xp, max } = xpRange(level, global.multiplier || 1)
  const sn = createHash('md5').update(String(who)).digest('hex')
  const phone = formatPhoneNumber(who)

  let nacionalidad = 'غير معروفة'
  try {
    const response = await fetch(`${info.apis}/tools/country?text=${phone}`)
    const data = await response.json()
    if (data?.result?.name) nacionalidad = `${data.result.name} ${data.result.emoji}`
  } catch (_) {}

  let relacion = '❌ *أنت غير مرتبط، أعزب 🤑.*'
  if (marry) {
    const parejaRes = await m.db.query('SELECT nombre FROM usuarios WHERE id = $1', [marry])
    const nombrePareja = parejaRes.rows[0]?.nombre || 'غير معروف'
    relacion = `💍 *مرتبط بـ:* ${nombrePareja}`
  }

  const texto = `*「 الملف الشخصي 」*

👤 *الاسم:* ${nombre}
📱 *الرقم:* ${phone}
🔗 *الرابط:* wa.me/${who.split('@')[0]}
🌍 *الجنسية:* ${nacionalidad}
💎 *الحد اليومي:* ${limite ?? 0}
🎚️ *المستوى:* ${level}
📝 *مسجل:* ${registered ? 'نعم' : 'لا'}

${relacion}

*•━━━━⪻ 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 ⪼━━━━•*`

  await conn.sendFile(m.chat, buffer, 'perfil.jpg', texto, m)
}

handler.help = ['بروفايل', 'بروفايل *@شخص*']
handler.tags = ['عام']
handler.command = /^بروفايل$/i
handler.register = true

export default handler
