let handler = async (m, { conn, participants, metadata, args }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './media/Menu1.jpg'
  const groupAdmins = participants.filter(p => p.admin)
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n➥ ')
  const owner = metadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

  let text = `•══✪〘 *الطاقم الإداري* 〙✪══•

> *مطلوب تدخل أحد المشرفين* 

*• اسم المجموعة:* ${metadata.subject}

*• المشرفون:*
➥ ${listAdmin}

> [ ⚠️ ] *استخدم هذا الأمر فقط في الحالات الطارئة*
`.trim()

  conn.sendFile(m.chat, pp, 'staff.jpg', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}

handler.help = ['موظفين', 'قائمة_الادمن', 'ادمن']
handler.tags = ['group']
handler.command = ['موظفين', 'قائمة_الادمن', 'ادمن'] // جميعها تعمل لنفس الأمر
handler.group = true
handler.register = true

export default handler
