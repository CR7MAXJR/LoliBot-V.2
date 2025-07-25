// كود الزواج - معرب بواسطة: https://github.com/elrebelde21 & ChatGPT

const handler = async (m, { conn, args }) => {
  const res = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [m.sender])
  const user = res.rows[0]

  if (user.marry) {
    const pareja = await m.db.query('SELECT nombre FROM usuarios WHERE id = $1', [user.marry])
    const spouseName = pareja.rows[0]?.nombre || 'بدون اسم'
    if (user.marry === (m.mentionedJid[0] || '')) {
      return conn.reply(m.chat, `⚠️ أنت بالفعل متزوج من @${user.marry.split('@')[0]}.\nلا حاجة لإعادة الزواج من نفس الشخص 🤨`, m, { mentions: [m.sender] })
    }
    return conn.reply(m.chat, `⚠️ أنت بالفعل متزوج من @${user.marry.split('@')[0]} (${spouseName}).\nهل تنوي الخيانة؟ 🤨`, m, { mentions: [m.sender] })
  }

  const mentionedUser = m.mentionedJid[0]
  if (!mentionedUser) return m.reply('⚠️ من فضلك، قم بذكر الشخص الذي تريد الزواج منه باستخدام @الاسم')
  if (mentionedUser === m.sender) return m.reply('⚠️ لا يمكنك الزواج من نفسك!')

  const check = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [mentionedUser])
  if (!check.rows[0]) return m.reply('⚠️ المستخدم الذي تحاول الزواج منه غير موجود في قاعدة البيانات.')
  if (check.rows[0].marry) return m.reply('⚠️ هذا المستخدم متزوج بالفعل من شخص آخر.')

  await m.db.query('UPDATE usuarios SET marry_request = $1 WHERE id = $2', [m.sender, mentionedUser])
  await conn.reply(m.chat, `💍 *@${m.sender.split('@')[0]}* يتقدم بطلب الزواج! 😳\n@${mentionedUser.split('@')[0]}، هل تقبل؟\n\n❤️ اكتب *أقبل*\n💔 اكتب *أرفض*`, m, { mentions: [m.sender, mentionedUser] })

  setTimeout(async () => {
    const again = await m.db.query('SELECT marry_request FROM usuarios WHERE id = $1', [mentionedUser])
    if (again.rows[0]?.marry_request) {
      await m.db.query('UPDATE usuarios SET marry_request = NULL WHERE id = $1', [mentionedUser])
      await conn.reply(m.chat, '⏱️ انتهى الوقت! لم يتم الرد على طلب الزواج.', m)
    }
  }, 60000)
}

handler.before = async (m) => {
  const res = await m.db.query('SELECT marry_request FROM usuarios WHERE id = $1', [m.sender])
  const req = res.rows[0]?.marry_request
  if (!req) return

  const response = m.originalText.toLowerCase()
  if (response === 'أقبل') {
    await m.db.query('UPDATE usuarios SET marry = $1, marry_request = NULL WHERE id = $2', [req, m.sender])
    await m.db.query('UPDATE usuarios SET marry = $1 WHERE id = $2', [m.sender, req])
    await conn.reply(m.chat, `✅ مبروك 🎉\n@${req.split('@')[0]} و @${m.sender.split('@')[0]} تزوجوا الآن رسميًا! 💍`, m, { mentions: [req, m.sender] })
  } else if (response === 'أرفض') {
    await m.db.query('UPDATE usuarios SET marry_request = NULL WHERE id = $1', [m.sender])
    await conn.reply(m.chat, `💔 لقد رفضت طلب الزواج من @${req.split('@')[0]}`, m, { mentions: [req] })
  }
}

handler.help = ['زواج @الشخص']
handler.tags = ['اقتصاد']
handler.command = ['زواج'] // اختصار الأمر
handler.register = true

export default handler
