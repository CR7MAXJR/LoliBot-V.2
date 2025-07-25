import { db } from '../lib/postgres.js'

const items = ['limite', 'exp', 'joincount', 'money', 'potion', 'trash', 'wood', 'rock', 'string', 'petFood', 'emerald', 'diamond', 'gold', 'iron', 'common', 'uncoommon', 'mythic', 'legendary', 'pet']
let confirmation = {}

async function handler(m, { conn, args, usedPrefix, command }) {
if (confirmation[m.sender]) return m.reply('⚠️ أنت بالفعل تقوم بعملية تحويل، الرجاء الانتظار.')

const userRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [m.sender])
let user = userRes.rows[0]
if (!user) return
const item = items.filter(v => v in user && typeof user[v] == 'number')
let lol = `⧼⧼⧼ 💱 عملية تحويل 💱 ⧽⧽⧽

> *${usedPrefix + command} النوع الكمية @شخص*

❏ مثال:
* *${usedPrefix + command} exp 30 @0*

┏•「 ✅ الموارد المتاحة 」
┃
┃ 💎 الألماس = limite
┃ 🪙 العملات = money 
┃ ⚡ الخبرة = exp 
┗•`.trim()

const type = (args[0] || '').toLowerCase()
if (!item.includes(type)) return m.reply(lol, m.chat, { mentions: conn.parseMention(lol) })

const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1
let who = m.mentionedJid?.[0] || (args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')
if (!who) return m.reply('⚠️ من فضلك قم بوسم المستخدم (@)')

const userToRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [who])
let userTo = userToRes.rows[0]
if (!userTo) return m.reply(`⚠️ المستخدم ${who} غير موجود في قاعدة البيانات.`)

if (user[type] * 1 < count) return m.reply(`❌ لا تملك الكمية الكافية من ${type.toUpperCase()}`)

let confirm = `⚠️ *تأكيد التحويل:*

> سيتم تحويل *${count} ${type}* إلى:
@${(who || '').replace(/@s\.whatsapp\.net/g, '')}

هل ترغب في المتابعة؟
• لديك 60 ثانية.

اكتب: (نعم) للموافقة
اكتب: (لا) للإلغاء`.trim()

await conn.reply(m.chat, confirm, m, { mentions: [who] })

confirmation[m.sender] = {
sender: m.sender,
to: who,
message: m,
type,
count,
timeout: setTimeout(() => {
m.reply('⏱️ تم إلغاء العملية لانتهاء الوقت.')
delete confirmation[m.sender]
}, 60 * 1000)
}}

handler.before = async m => {
if (!(m.sender in confirmation)) return
if (!m.originalText) return

let { timeout, sender, message, to, type, count } = confirmation[m.sender]
if (m.id === message.id) return

const userRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [sender])
const userToRes = await db.query('SELECT * FROM usuarios WHERE id = $1', [to])
let user = userRes.rows[0]
let userTo = userToRes.rows[0]
if (!user || !userTo) return m.reply('❌ المستخدمين غير صالحين.')

if (/^لا$/i.test(m.originalText)) {
clearTimeout(timeout)
delete confirmation[sender]
return m.reply('🚫 تم إلغاء العملية.')
}

if (/^نعم$/i.test(m.originalText)) {
const prev = user[type]
const prevTo = userTo[type]

user[type] -= count
userTo[type] += count

await db.query(`UPDATE usuarios SET ${type} = $1 WHERE id = $2`, [user[type], sender])
await db.query(`UPDATE usuarios SET ${type} = $1 WHERE id = $2`, [userTo[type], to])
m.reply(`✅ تم التحويل بنجاح:\n\n*${count} ${type}* إلى @${(to || '').replace(/@s\.whatsapp\.net/g, '')}`, null, { mentions: [to] })
clearTimeout(timeout)
delete confirmation[sender]
}
}

handler.help = ['حول [النوع] [العدد] [@tag]']
handler.tags = ['اقتصاد']
handler.command = ['حول']
handler.disabled = false
handler.register = true

export default handler

function special(type) {
let b = type.toLowerCase()
let special = (['common', 'uncoommon', 'mythic', 'legendary', 'pet'].includes(b) ? ' Crate' : '')
return special
}

function isNumber(x) {
return !isNaN(x)
}
