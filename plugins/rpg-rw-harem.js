// تم التعريب والتعديل بواسطة: https://github.com/elrebelde21

async function handler(m, { conn, args }) {
  if (!m.db) return;

  try {
    let targetUser = m.sender;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetUser = m.mentionedJid[0];
    }

    const { rows: userCharacters } = await m.db.query(
      'SELECT name, price FROM characters WHERE claimed_by = $1 ORDER BY name',
      [targetUser]
    );

    if (userCharacters.length === 0) {
      const targetUsername = targetUser === m.sender ? 'أنت' : `@${targetUser.split('@')[0]}`;
      return conn.reply(m.chat, `*${targetUsername}* لا تمتلك أي شخصية في النسواني الخاص بك.`, m, { mentions: [targetUser] });
    }

    const itemsPerPage = 6;
    const totalPages = Math.ceil(userCharacters.length / itemsPerPage);
    let page = parseInt(args[0]) || 1;
    if (page < 1 || page > totalPages) page = 1;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCharacters = userCharacters.slice(startIndex, endIndex);

    let message = `*\`👑 نسوانك الشخصي\`*\n\n`;
    message += `*• المستخدم:* @${targetUser.split('@')[0]}\n`;
    message += `*• عدد الشخصيات:* ${userCharacters.length}\n\n`;
    message += `*\`📜 قائمة الشخصيات:\`*\n`;

    currentPageCharacters.forEach((character, index) => {
      message += `${index + 1}. *${character.name}* (💰 ${character.price.toLocaleString()})\n`;
    });

    message += `\n> *• الصفحة:* ${page} من ${totalPages}`;
    return conn.reply(m.chat, message, m, { mentions: [targetUser] });

  } catch (e) {
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء عرض النسواني. حاول مرة أخرى.', m);
  }
}

handler.help = ['نسواني'];
handler.tags = ['gacha'];
handler.command = ['نسواني']; // الأمر المختصر والمعرب
handler.register = true;

export default handler;
