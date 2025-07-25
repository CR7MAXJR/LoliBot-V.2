import { db } from '../lib/postgres.js'

...(command !== 'setpromote' && command !== 'setdemote' && command !== 'ترقية' && command !== 'تنزيل' ? ['@group → اسم المجموعة'] : []),
...(command === 'setwelcome' || command === 'ترحيب' ? ['@desc → وصف المجموعة'] : []),
...(command === 'setpromote' || command === 'setdemote' || command === 'ترقية' || command === 'تنزيل' ? ['@author → من قام بالتنفيذ'] : [])
].join('\n• ')

const opciones = (command === 'setwelcome' || command === 'setbye' || command === 'ترحيب' || command === 'وداع') ? `*خيارات إضافية:*
• --foto → لإرسال الرسالة مع صورة
• --nofoto → لإرسال نص فقط بدون صورة` : ''

const ejemplo = command === 'setwelcome' || command === 'ترحيب' ? `مرحبًا @user، أهلاً بك في @group. اقرأ القوانين: @desc`
: command === 'setbye' || command === 'وداع' ? `وداعًا @user، شكرًا لتواجدك في @group.`
: command === 'setpromote' || command === 'ترقية' ? `@user تمت ترقيته بواسطة @author.`
: `@user تم تنزيل رتبته بواسطة @author.`

return m.reply(`*⚙️ تخصيص رسالة ${tipo} الخاصة بالمجموعة:*

*يمكنك استخدام المتغيرات التالية:*
• ${variables}\n${opciones}
*مثال على الاستخدام:*
➤ /${command} ${ejemplo} --foto`)
}

const hasFoto = text.includes('--foto')
const hasNoFoto = text.includes('--nofoto')
const cleanText = text.replace('--foto', '').replace('--nofoto', '').trim()

await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [m.chat])

if (command === 'setwelcome' || command === 'ترحيب') {
  await db.query(`UPDATE group_settings SET swelcome = $1${hasFoto ? ', photowelcome = true' : ''}${hasNoFoto ? ', photowelcome = false' : ''} WHERE group_id = $2`, [cleanText, m.chat])
  return m.reply(`✅ تم حفظ رسالة الترحيب${hasFoto ? ' مع صورة' : hasNoFoto ? ' بدون صورة' : ''}.`)
}

if (command === 'setbye' || command === 'وداع') {
  await db.query(`UPDATE group_settings SET sbye = $1${hasFoto ? ', photobye = true' : ''}${hasNoFoto ? ', photobye = false' : ''} WHERE group_id = $2`, [cleanText, m.chat])
  return m.reply(`✅ تم حفظ رسالة الوداع${hasFoto ? ' مع صورة' : hasNoFoto ? ' بدون صورة' : ''}.`)
}

if (command === 'setpromote' || command === 'ترقية') {
  await db.query(`UPDATE group_settings SET spromote = $1 WHERE group_id = $2`, [cleanText, m.chat])
  return m.reply("✅ تم حفظ رسالة الترقية.")
}

if (command === 'setdemote' || command === 'تنزيل') {
  await db.query(`UPDATE group_settings SET sdemote = $1 WHERE group_id = $2`, [cleanText, m.chat])
  return m.reply("✅ تم حفظ رسالة التنزيل.")
}}

handler.help = ['setwelcome <نص>', 'setbye <نص>', 'ترحيب <نص>', 'وداع <نص>']
handler.tags = ['group']
handler.command = ['setwelcome', 'setbye', 'setpromote', 'setdemote', 'ترحيب', 'وداع', 'ترقية', 'تنزيل']
handler.group = true
handler.admin = true
handler.register = true

export default handler
