let handler = async (m, { conn, text }) => {
  let id = text ? text : m.chat  
  await conn.reply(id, '*📤 البوت سيغادر المجموعة، إلى اللقاء 👋*') 
  await conn.groupLeave(id)
}

handler.help = ['خروج']
handler.tags = ['المالك']
handler.command = /^خروج$/i
handler.owner = true
handler.register = true

export default handler
