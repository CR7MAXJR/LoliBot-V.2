import { canLevelUp, xpRange } from '../lib/levelling.js'
import { getRole } from './_autolevelup.js'
import axios from 'axios'

const multiplier = 650

let handler = async (m, { conn }) => {
  const name = m.pushName
  const res = await m.db.query('SELECT exp, level, role, money FROM usuarios WHERE id = $1', [m.sender])
  let user = res.rows[0]
  const { exp, level, role, money } = user

  if (!canLevelUp(level, exp, multiplier)) {
    const { min, xp, max } = xpRange(level, multiplier)
    return m.reply(`*📊 إحصائياتك الحالية:*

👤 *الاسم:* ${name}
📈 *الخبرة:* ${exp - min} / ${xp}
🎚️ *المستوى:* ${level}
🎖️ *الرتبة:* ${role}

▫️ تحتاج *${max - exp}* نقطة خبرة للانتقال للمستوى التالي.`)
  }

  const before = level
  let newLevel = level
  while (canLevelUp(newLevel, exp, multiplier)) newLevel++
  const newRole = getRole(newLevel).name
  await m.db.query('UPDATE usuarios SET level = $1, role = $2 WHERE id = $3', [newLevel, newRole, m.sender])

  const str = `🎉 *تهانينا ${name}!* لقد وصلت إلى مستوى جديد!

🔸 *المستوى السابق:* ${before}
🔸 *المستوى الحالي:* ${newLevel}
🔸 *الرتبة الجديدة:* ${newRole}

_كلما تفاعلت أكثر مع البوت، زاد مستواك بسرعة!_`

  try {
    const apiURL = `${info.apis}/canvas/balcard?url=${encodeURIComponent(m.pp)}&background=https://telegra.ph/file/66c5ede2293ccf9e53efa.jpg&username=${encodeURIComponent(name)}&discriminator=${m.sender.replace(/[^0-9]/g, '')}&money=${money}&xp=${exp}&level=${newLevel}`
    const result = await axios.get(apiURL, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(result.data)
    await conn.sendFile(m.chat, buffer, 'levelup.jpg', str, m)
  } catch {
    await conn.fakeReply(m.chat, str, '13135550002@s.whatsapp.net', `📊 مستواك الجديد`, 'status@broadcast')
  }
}

handler.help = ['لفل']
handler.tags = ['اقتصاد']
handler.command = ['لفل'] // تغيير الأمر إلى لفل فقط
handler.register = true

export default handler
