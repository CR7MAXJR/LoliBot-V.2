const handler = async (m, { conn, usedPrefix }) => {
  const who = m.quoted?.sender || m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);
  const res = await m.db.query("SELECT limite, exp, money, banco FROM usuarios WHERE id = $1", [who]);
  const user = res.rows[0];
  if (!user) throw '✳️ المستخدم غير موجود في قاعدة البيانات.';

  await conn.reply(m.chat, `*•───⧼⧼⧼ 📊 𝑹𝑨𝑺𝑰𝑫𝑶 ⧽⧽⧽───•*

@${who.split('@')[0]} يملك:

*💎 الألماس:* _${user.limite}_
*⬆️ الخبرة:* _${user.exp}_
*🪙 عملات لولي:* _${user.money}_
> خارج البنك

*•───⧼⧼⧼ 🏦 البنك ⧽⧽⧽───•*

*💰 الرصيد:* _${user.banco} 💎_
> داخل البنك 🏦

•──────────────•

📌 *ملاحظة:*
يمكنك شراء الألماس باستخدام الأوامر التالية:
*• ${usedPrefix}شراء <الكمية>*
*• ${usedPrefix}شراء_الكل*`, m, { mentions: [who] });
};

handler.help = ['الرصيد'];
handler.tags = ['اقتصاد'];
handler.command = ['الرصيد']; // اختصار وتعريب الأمر
handler.register = true;

export default handler;
