const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin }) => {
if (!args[0]) return m.reply(`*⚠️ الرجاء إدخال مفتاح الدولة، مثال:* ${usedPrefix + command} +966`);
if (isNaN(args[0])) return m.reply(`*⚠️ يجب أن يكون المفتاح رقمًا صالحًا، مثال:* ${usedPrefix + command} +966`);

const prefijo = args[0].replace(/[+]/g, '');
const encontrados = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(prefijo));
const numeros = encontrados.map(v => '⭔ @' + v.replace(/@.+/, ''));
if (!encontrados.length) return m.reply(`*📵 لا يوجد أي رقم بالمفتاح +${prefijo} في هذه المجموعة.*`);

switch (command) {
case 'listanum':
case 'listnum':
case 'قائمة_برمز':
case 'عرض_برمز':
return conn.reply(m.chat, `*📋 الأرقام الموجودة بالمفتاح +${prefijo}:*\n\n${numeros.join('\n')}`, m, { mentions: encontrados });

case 'kicknum':
case 'طرد_برمز':
if (!isBotAdmin) return m.reply('*⚠️ البوت ليس مشرفًا، لا يمكنه إزالة الأعضاء.*');
await conn.reply(m.chat, `*⚠️ بدء حذف الأرقام بالمفتاح +${prefijo}...*\n> _سيتم الحذف كل 10 ثوانٍ_`, m);
const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
for (const user of encontrados) {
const error = `@${user.split('@')[0]} تم حذفه مسبقًا أو غادر المجموعة.`;
const protegido = [ownerGroup, conn.user.jid, global.owner + '@s.whatsapp.net'];

if (!protegido.includes(user)) {
try {
const r = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
if (r[0]?.status === '404') await m.reply(error, m.chat, { mentions: [user] });
} catch (e) {
await m.reply(`⚠️ تعذر حذف @${user.split('@')[0]}`, m.chat, { mentions: [user] });
}
await delay(10000);
}}
return m.reply('*✅ تم الانتهاء من عملية الحذف.*');
}};
handler.help = ['kicknum', 'listnum', 'طرد_برمز', 'عرض_برمز', 'قائمة_برمز'];
handler.tags = ['group'];
handler.command = /^(kicknum|listanum|listnum|طرد_برمز|عرض_برمز|قائمة_برمز)$/i;
handler.group = handler.botAdmin = handler.admin = true;
export default handler;

const delay = ms => new Promise(res => setTimeout(res, ms));
