import { db } from '../lib/postgres.js'
import { getSubbotConfig } from '../lib/postgres.js'

const handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
const isEnable = /true|enable|فتح|تشغيل|(turn)?on|1/i.test(command)
const type = (args[0] || '').toLowerCase()
  .replace('الترحيب', 'welcome')
  .replace('الإشعارات', 'detect')
  .replace('روابط', 'antilink')
  .replace('جميع_الروابط', 'antilink2')
  .replace('طرد_الارقام', 'antifake')
  .replace('18+', 'modohorny')
  .replace('مشرفين_فقط', 'modoadmin')
  .replace('خاص', 'antiprivate')
  .replace('الاتصالات', 'anticall');

const chatId = m.chat
const botId = conn.user?.id
const cleanId = botId.replace(/:\d+/, '');
const isSubbot = botId !== 'main'
let isAll = false, isUser = false
let res = await db.query('SELECT * FROM group_settings WHERE group_id = $1', [chatId]);
let chat = res.rows[0] || {};
const getStatus = (flag) => m.isGroup ? (chat[flag] ? '✅' : '❌') : '⚠️';

let menu = `*『 ⚙️ الإعدادات العامة للبوت 』*\n\n`;
menu += `> *اختر إحدى الخيارات أدناه*\n> *لبدء التكوين في المجموعة*\n\n`;
menu += `● *تنبيهات الحالة:*
✅ ⇢ *مفعلة*
❌ ⇢ *معطلة*
⚠️ ⇢ *هذا ليس جروب*\n\n`;
menu += `*『 إعدادات المشرفين 』*\n\n`;
menu += `🎉 الترحيب ${getStatus('welcome')}\n• إرسال رسالة ترحيب\n• ${usedPrefix + command} الترحيب\n\n`;
menu += `📣 الإشعارات ${getStatus('detect')}\n• تنبيه بتغييرات المجموعة\n• ${usedPrefix + command} الإشعارات\n\n`;
menu += `🔗 روابط ${getStatus('antilink')}\n• منع روابط المجموعات\n• ${usedPrefix + command} روابط\n\n`;
menu += `🌐 جميع الروابط ${getStatus('antilink2')}\n• منع أي رابط\n• ${usedPrefix + command} جميع_الروابط\n\n`;
menu += `🕵️ طرد الأرقام ${getStatus('antifake')}\n• طرد أرقام من خارج الدولة\n• ${usedPrefix + command} طرد_الارقام\n\n`;
menu += `🔞 محتوى +18 ${getStatus('modohorny')}\n• السماح بمحتوى للبالغين\n• ${usedPrefix + command} 18+\n\n`;
menu += `🔒 أوامر للمشرفين فقط ${getStatus('modoadmin')}\n• منع الأعضاء من استخدام الأوامر\n• ${usedPrefix + command} مشرفين_فقط\n\n`;
  
menu += `\n*『 إعدادات المالك 』*\n\n`;
menu += `🚫 منع الخاص ${isSubbot ? (getSubbotConfig(botId).antiPrivate ? '✅' : '❌') : '⚠️'}
• منع الأوامر في الخاص
• ${usedPrefix + command} خاص\n\n`;
menu += `📵 منع الاتصالات ${isSubbot ? (getSubbotConfig(botId).anticall ? '✅' : '❌') : '⚠️'}
• حظر من يتصل بالبوت
• ${usedPrefix + command} الاتصالات`;

switch (type) {
case 'welcome':
case 'detect':
case 'antilink':
case 'antilink2':
case 'antifake':
case 'modoadmin':
  if (!m.isGroup) throw '⚠️ هذا الأمر يعمل داخل المجموعات فقط.'
  if (!isAdmin) throw "⚠️ هذا الأمر للمشرفين فقط."
  await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
  await db.query(`UPDATE group_settings SET ${type} = $1 WHERE group_id = $2`, [isEnable, chatId])
  break

case 'nsfw': case "modohorny": case "modocaliente":
  if (!m.isGroup) throw '⚠️ هذا الأمر يعمل داخل المجموعات فقط.'
  if (!isOwner) throw "❌ هذا الخيار متاح فقط للمالك."
  await db.query(`INSERT INTO group_settings (group_id) VALUES ($1) ON CONFLICT DO NOTHING`, [chatId])
  await db.query(`UPDATE group_settings SET modohorny = $1 WHERE group_id = $2`, [isEnable, chatId])
  break

case 'antiprivate':
  if (!isSubbot && !isOwner) return m.reply('❌ فقط المالك أو البوتات الفرعية يمكنهم تغيير هذا.');
  await db.query(`INSERT INTO subbots (id, anti_private)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET anti_private = $2`, [cleanId, isEnable]);
  isAll = true;
  break;

case 'anticall':
  if (!isSubbot && !isOwner) return m.reply('❌ فقط المالك أو البوتات الفرعية يمكنهم تغيير هذا.');
  await db.query(`INSERT INTO subbots (id, anti_call)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET anti_call = $2`, [cleanId, isEnable]);
  isAll = true;
  break;

default:
  return m.reply(menu.trim());
}
await m.reply(`✅ تم *${isEnable ? 'تفعيل' : 'تعطيل'}* خيار *${args[0]}* ${isAll ? 'لكل البوت' : 'لهذه المجموعة'} بنجاح.`)
}

handler.help = ['تفعيل <الخيار>', 'تعطيل <الخيار>']
handler.tags = ['config']
handler.command = /^(enable|disable|تفعيل|تعطيل)$/i
handler.register = true

export default handler
