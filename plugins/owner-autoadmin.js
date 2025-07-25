let handler = async (m, { conn, isAdmin }) => {
  if (m.fromMe) throw '⚠️ لا يمكن تنفيذ هذا الأمر على نفسك كمطور.'
  if (isAdmin) return m.reply('✅ أنت بالفعل مشرف في هذه المجموعة.')
  await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")
  m.reply('✅ تم ترقيتك إلى مشرف بنجاح.')
}

handler.help = ['ادمن']
handler.tags = ['المالك']
handler.command = /^ادمن|ترقية|autoadmin$/i
handler.owner = true
handler.botAdmin = true

export default handler
