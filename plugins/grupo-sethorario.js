import { db } from '../lib/postgres.js'

let handler = async (m, { args }) => {
  const rango = (args[0] || '').trim()

  // التحقق من صحة التنسيق
  if (!/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(rango)) {
    throw '📌 الصيغة الصحيحة: *.تحديدالوقت 23:00-06:00*'
  }

  // التأكد من أن السجل موجود
  await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [m.chat])

  // تحديث الوقت
  await db.query(`UPDATE group_settings SET nsfw_horario = $1 WHERE group_id = $2`, [rango, m.chat])

  // الرد على المستخدم
  m.reply(`✅ تم تحديد وقت محتوى +18 ليكون من *${rango}*`)
}

handler.help = ['تحديدالوقت 23:00-06:00']
handler.tags = ['admin']
handler.command = /^تحديدالوقت$/i // ← الأمر أصبح بالعربي تمامًا
handler.admin = true

export default handler
