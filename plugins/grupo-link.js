import fs from 'fs';

const handler = async (m, { conn }) => {
  const group = m.chat;
  const code = await conn.groupInviteCode(group);
  m.reply('🔗 رابط المجموعة:\nhttps://chat.whatsapp.com/' + code);
};

handler.help = ['رابط'];
handler.tags = ['group'];
handler.command = /^رابط$/i; // الأمر العربي فقط
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
