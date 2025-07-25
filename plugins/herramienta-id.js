let handler = async (m, { conn, text, isOwner }) => {
  let USER_ID = m.user.lid 
  conn.fakeReply(
    m.chat, 
    USER_ID, 
    '0@s.whatsapp.net', 
    `👇 إليك رقمك السري (LID) 👇`, 
    'status@broadcast'
  )
  // m.reply(USER_ID) // تم التعليق عليه حسب الكود الأصلي
}

handler.help = ['رقمي_السري']
handler.tags = ['أدوات']
handler.command = /^رقمي_السري$/i

export default handler;
