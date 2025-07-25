const handler = async (m, { conn, args }) => {
  const page = Math.max(1, parseInt(args[0]) || 1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const now = Date.now();
  const twoDaysMs = 172800000; // يومين

  const res = await m.db.query(`
    SELECT id, nombre, dailystreak, lastclaim 
    FROM usuarios 
    WHERE dailystreak > 0
    ORDER BY dailystreak DESC
  `);

  const users = res.rows.filter(u => now - Number(u.lastclaim) <= twoDaysMs);
  const totalActivos = users.length; 

  if (!users.length) return m.reply(`⚠️ لا يوجد مستخدمون نشطون في سلسلة اليومية.\n\n📌 لا تنسَ استخدام الأمر /مطالبة يوميًا لتظهر هنا!`);

  const paginated = users.slice(offset, offset + pageSize);

  if (!paginated.length) return m.reply(`⚠️ لا يوجد مستخدمون في هذه الصفحة.\n\n📌 لا تنسَ استخدام الأمر /مطالبة يوميًا لتظهر هنا!`);

  let ranking = `🏆 *أعلى السلاسل اليومية* (صفحة ${page})\n📊 المستخدمون النشطون حاليًا: *${totalActivos}*\n\n`;

  for (let i = 0; i < paginated.length; i++) {
    const user = paginated[i];
    const numero = user.id.replace(/@.+/, '');
    const nombre = (user.nombre || `+${numero}`);
    const puesto = offset + i + 1;

    const streak = user.dailystreak;
    let premio = '';

    if (streak >= 100) {
      premio = '🏆';
    } else if (streak >= 50) {
      premio = '🥇'; 
    } else if (streak >= 30) {
      premio = '🏅'; 
    } else if (streak % 7 === 0) {
      premio = '⭐'; 
    }

    const corona = (puesto === 1) ? '(👑)' : '';

    ranking += `${puesto}. *${nombre}* ${corona}\n    🔥 سلسلة: ${streak} يوم/أيام ${premio}\n\n`;
  }

  ranking += `\n✨ _استمر في المطالبة اليومية باستخدام الأمر /مطالبة لتحافظ على السلسلة وتربح مكافآت مميزة!_ ✨`;

  m.reply(ranking.trim());
};

handler.help = ['الرتبة [الصفحة]'];
handler.tags = ['اقتصاد'];
handler.command = ['الرتبة'];
handler.register = true;

export default handler;
