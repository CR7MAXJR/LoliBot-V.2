const handler = async (m, { conn }) => {
  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `*_تم إعادة تعيين رابط الدعوة بنجاح._*\n*• الرابط الجديد:* ${'https://chat.whatsapp.com/' + revoke}`, m);
};

handler.help = ['اعادة_الرابط'];
handler.tags = ['group'];
handler.command = ['اعادة_الرابط', 'اعادةالرابط', 'رابط_جديد'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
handler.register = true;

export default handler;
