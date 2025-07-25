// الكود الأصلي بواسطة: https://github.com/elrebelde21

async function handler(m, { conn }) {
  if (!m.db) return;

  try {
    const { rows: characters } = await m.db.query('SELECT claimed_by FROM characters');
    const claimedCharacters = characters.filter(c => c.claimed_by);

    const userClaims = claimedCharacters.reduce((acc, character) => {
      acc[character.claimed_by] = (acc[character.claimed_by] || 0) + 1;
      return acc;
    }, {});

    const sortedUsers = Object.entries(userClaims)
      .sort(([, a], [, b]) => b - a);

    const topUsers = sortedUsers.slice(0, 10);
    let text = `📊 *「 صدارة الشخصيات 」* 📊\n`;
    text += `- عدد الشخصيات المُطالبة: *${claimedCharacters.length}*\n\n`;
    text += `*🏆 أفضل المستخدمين من حيث عدد الشخصيات:*\n`;

    topUsers.forEach(([user, count], index) => {
      text += `\n${index + 1}- @${user.split('@')[0]} » ${count} شخصية`;
    });

    // البحث عن ترتيب المستخدم الحالي
    const userIndex = sortedUsers.findIndex(([user]) => user === m.sender);
    if (userIndex !== -1) {
      const rank = userIndex + 1;
      const userCount = sortedUsers[userIndex][1];
      text += `\n\n📌 ترتيبك الحالي: *${rank}* بـ *${userCount}* شخصية`;
    } else {
      text += `\n\n📌 لم يتم العثور على أي شخصية مطالبة باسمك حتى الآن.`;
    }

    await conn.sendMessage(
      m.chat,
      {
        text: text + `\n\n> _استمر في استخدام البوت للمطالبة بالمزيد من الشخصيات!_`,
        contextInfo: { mentionedJid: topUsers.map(([user]) => user) },
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
  }
}

handler.help = ['صدارة'];
handler.tags = ['gacha'];
handler.command = ['صدارة']; // اختصار وتعريب الأمر
handler.register = true;

export default handler;
