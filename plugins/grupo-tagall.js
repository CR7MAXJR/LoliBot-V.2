let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("❌ هذا الأمر خاص بالمجموعات فقط.");
  let users = (await conn.groupMetadata(m.chat)).participants.map(p => p.id)
  let text = users.map(u => `@${u.split('@')[0]}`).join('\n')
  conn.sendMessage(m.chat, { text, mentions: users }, { quoted: m })
}
handler.command = ['منشن', 'tagall']
handler.group = true
export default handler
