const handler = async (m, { conn, args }) => {
  const targetId = m.mentionedJid[0] || args[0];
  if (!targetId) return m.reply("⚠️ يجب عليك الإشارة إلى الشخص الذي تريد الطلاق منه.");

  const userRes = await m.db.query('SELECT marry FROM usuarios WHERE id = $1', [m.sender]);
  const user = userRes.rows[0];
  if (!user || !user.marry || user.marry !== targetId)
    return m.reply("⚠️ أنت لست متزوجًا من هذا الشخص حتى تطلقه.");

  await m.db.query('UPDATE usuarios SET marry = NULL WHERE id = $1', [m.sender]);
  await m.db.query('UPDATE usuarios SET marry = NULL WHERE id = $1', [targetId]);

  const nombre1 = await conn.getName(m.sender);
  const nombre2 = await conn.getName(targetId);

  return conn.reply(
    m.chat,
    `@${m.sender.split('@')[0]} (${nombre1}) طلق @${targetId.split('@')[0]} (${nombre2}) وأصبحوا الآن منفصلين 🫣`,
    m,
    { mentions: [m.sender, targetId] }
  );
};

handler.help = ['طلاق @شخص'];
handler.tags = ['اقتصاد'];
handler.command = ['طلاق']; // اختصار الأمر
handler.register = true;

export default handler;
