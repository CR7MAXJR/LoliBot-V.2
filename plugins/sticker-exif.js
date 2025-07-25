import { db } from '../lib/postgres.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`*⚠️ الاستخدام:* ${usedPrefix}${command} اسم_الحزمة | المؤلف\n*مثال:* ${usedPrefix}${command} لولي_بوت | elrebelde21`)

  let text = args.join(' ').split('|')
  let packname = text[0].trim()
  let author = text[1] ? text[1].trim() : ''

  if (!packname) return m.reply('⚠️ يجب إدخال *اسم الحزمة* على الأقل.')
  if (packname.length > 600) return m.reply('⚠️ اسم الحزمة طويل جدًا (الحد الأقصى 600 حرف).')
  if (author && author.length > 650) return m.reply('⚠️ اسم المؤلف طويل جدًا (الحد الأقصى 650 حرف).')

  await db.query(`UPDATE usuarios
    SET sticker_packname = $1,
        sticker_author = $2
    WHERE id = $3`, [packname, author || null, m.sender])

  await m.reply(`✅ تم تحديث *البيانات التعريفية (EXIF)* لملصقاتك بنجاح.\n\n◉ *اسم الحزمة:* ${packname}\n◉ *المؤلف:* ${author || 'لا يوجد'}\n\n> يمكنك الآن إنشاء ملصقاتك المخصصة! 😎`)
}

handler.help = ['اكسيف <اسم_الحزمة> | <المؤلف>']
handler.tags = ['sticker']
handler.command = ['اكسيف']
handler.register = true

export default handler
