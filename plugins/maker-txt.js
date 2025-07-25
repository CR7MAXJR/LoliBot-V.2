let handler = async (m, { conn, text, usedPrefix, command }) => {
  let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : ''

  if (command == 'نص') {
    if (!teks) return m.reply(`⚠️ ماذا تريد أن أكتب؟\nاستخدم الأمر بالشكل التالي:\n\nمثال: *${usedPrefix + command}* مرحبًا لولي بوت`)
    let img = `${global.APIs.fgmods.url}/maker/txt?text=${encodeURIComponent(teks)}&apikey=${global.APIs.fgmods.key}`;
    conn.sendFile(m.chat, img, 'text.png', `✍🏻 تم إنشاء النص بنجاح!\n${info.wm}`, m);
  }

  if (command == 'كود') {
    if (!teks) return m.reply(`⚠️ اكتب الكود الذي تريد تحويله لصورة\nمثال:\n*${usedPrefix + command}* case "مرحبا":\nm.reply("أهلًا")\nbreak`)
    let res = `https://www.archive-ui.biz.id/api/maker/carbonify?text=${encodeURIComponent(teks)}`
    await conn.sendFile(m.chat, res, 'code.jpg', null, m)
  }
}

handler.help = ['نص', 'كود']
handler.tags = ['fun']
handler.command = ['نص', 'كود']
handler.limit = 1
handler.register = true 

export default handler
