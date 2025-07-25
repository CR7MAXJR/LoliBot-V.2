let handler = async (m, { conn, args, command, isOwner }) => {
let groupId = m.isGroup ? m.chat : null;
let target = args[0]?.replace(/@|\+|\s/g, '') + '@s.whatsapp.net';

if (!m.isGroup) return m.reply('❗ هذا الأمر يُستخدم داخل المجموعات فقط.');

switch (command) {
case 'فتح':
await conn.groupSettingUpdate(groupId, 'not_announcement');
m.reply('🟢 تم فتح المجموعة! يمكن للجميع الكتابة.');
break;

case 'اغلاق':
await conn.groupSettingUpdate(groupId, 'announcement');
m.reply('🔒 تم إغلاق المجموعة! فقط المشرفين يمكنهم الكتابة.');
break;

case 'اعطاءادمن':
if (!args[0]) return m.reply('⚠️ أشر إلى العضو أو ضع رقمه.');
await conn.groupParticipantsUpdate(groupId, [target], 'promote');
m.reply(`✅ @${target.split('@')[0]} تمت ترقيته إلى مشرف.`);
break;

case 'ازالةادمن':
if (!args[0]) return m.reply('⚠️ أشر إلى العضو أو ضع رقمه.');
await conn.groupParticipantsUpdate(groupId, [target], 'demote');
m.reply(`✅ @${target.split('@')[0]} تم إزالة صلاحياته كمشرف.`);
break;

case 'طرد':
if (!args[0]) return m.reply('⚠️ أشر إلى العضو أو ضع رقمه.');
await conn.groupParticipantsUpdate(groupId, [target], 'remove');
m.reply(`🗑️ @${target.split('@')[0]} تم طرده من المجموعة.`);
break;

case 'قبول':
if (!args[0]) return m.reply('⚠️ ضع الرقم المطلوب قبوله.');
await conn.groupRequestParticipantsUpdate(groupId, [target], 'approve');
m.reply(`✅ @${target.split('@')[0]} تم قبوله في المجموعة.`);
break;

default:
m.reply('⚠️ أمر غير معروف.');
}
};

handler.help = ['فتح', 'اغلاق', 'طرد @', 'اعطاءادمن @', 'ازالةادمن @', 'قبول +رقم'];
handler.tags = ['group'];
handler.command = /^(فتح|اغلاق|طرد|اعطاءادمن|ازالةادمن|قبول)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
