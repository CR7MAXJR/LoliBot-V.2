const ro = 3000;

const handler = async (m, { conn }) => {
  const now = Date.now();
  const resRobber = await m.db.query('SELECT exp, lastrob FROM usuarios WHERE id = $1', [m.sender]);
  const robber = resRobber.rows[0];
  const cooldown = 3600000; // ساعة واحدة
  const timeLeft = (robber.lastrob ?? 0) + cooldown - now;

  if (timeLeft > 0) {
    return m.reply(`🚓 الشرطة تراقب، عد بعد: *${msToTime(timeLeft)}*`);
  }

  let الضحية;
  if (m.isGroup) {
    الضحية = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted?.sender;
  } else {
    الضحية = m.chat;
  }

  if (!الضحية) return conn.reply(m.chat, `⚠️ *قم بالإشارة إلى شخص لتسرق نقاط خبرته (XP)*`, m);
  if (الضحية === m.sender) return m.reply(`❌ لا يمكنك سرقة نفسك!`);

  const resVictim = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [الضحية]);
  const victim = resVictim.rows[0];
  if (!victim) return m.reply(`❌ المستخدم غير موجود في قاعدة البيانات.`);

  const الكمية = Math.floor(Math.random() * ro);
  if ((victim.exp ?? 0) < الكمية) {
    return conn.reply(
      m.chat,
      `@${الضحية.split('@')[0]} يملك أقل من ${ro} نقطة XP.\n> لا تسرق من الفقراء 😞`,
      m,
      { mentions: [الضحية] }
    );
  }

  await m.db.query('UPDATE usuarios SET exp = exp + $1, lastrob = $2 WHERE id = $3', [الكمية, now, m.sender]);
  await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [الكمية, الضحية]);

  return conn.reply(
    m.chat,
    `💸 *لقد سرقت ${الكمية} نقطة XP من @${الضحية.split('@')[0]}*`,
    m,
    { mentions: [الضحية] }
  );
};

handler.help = ['اسرقه'];
handler.tags = ['اقتصاد'];
handler.command = /^اسرقه$/i;
handler.register = true;

export default handler;

function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours} ساعة ${minutes} دقيقة`;
}
