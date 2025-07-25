import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال رابط لأخذ لقطة شاشة، مثال: https://skyultraplus.com`)
  
  await m.react('⌛')
  
  try {
    let ss = await (await fetch(`https://api.dorratz.com/ssweb?url=${args[0]}`)).buffer()
    conn.sendFile(m.chat, ss, 'screenshot.png', '✅ تم التقاط الصورة بنجاح!', m)
    await m.react('✅')
  } catch {
    handler.limit = false
    await m.react('❌')
    m.reply('❌ حدث خطأ أثناء محاولة التقاط لقطة الشاشة.')
  }
}

handler.help = ['لقطة', 'لقطة_موقع'].map(v => v + ' *<رابط>*')
handler.tags = ['tools']
handler.command = /^لقطة(_?موقع)?$/i
handler.register = true
handler.limit = 1

export default handler
