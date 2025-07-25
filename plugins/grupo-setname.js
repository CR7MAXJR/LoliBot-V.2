let handler = async (m, { conn, text }) => {
  if (!text) throw '⚠️ الرجاء كتابة اسم جديد للمجموعة.'
  try {
    await conn.groupUpdateSubject(m.chat, text)
    m.reply('✅ تم تغيير اسم المجموعة بنجاح.')
  } catch (e) {
    throw '❌ فشل في تغيير الاسم. تأكد أن لدي صلاحية الأدمن.'
  }
}

handler.help = ['اسم_المجموعة <الاسم الجديد>']
handler.tags = ['group']
handler.command = /^(setname|newnombre|nuevonombre|اسم_المجموعة|تغيير_الاسم)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
