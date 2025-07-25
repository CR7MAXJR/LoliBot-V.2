// تم التعريب بواسطة: https://github.com/elrebelde21

async function handler(m, { conn, args }) {
  if (!m.db) return conn.sendMessage(m.chat, { text: '⚠️ خطأ: لا يمكن الاتصال بقاعدة البيانات.' }, { quoted: m });

  if (!m.mentionedJid || m.mentionedJid.length === 0 || args.length < 1) {
    return conn.reply(m.chat, '⚠️ الصيغة غير صحيحة. استعمل: .اهدي @الشخص اسم_الشخصية', m);
  }

  const recipient = m.mentionedJid[0];
  const characterName = args.slice(1).join(' ').trim();

  if (!characterName) return conn.reply(m.chat, '⚠️ من فضلك، اكتب اسم الشخصية التي تريد إهداءها.', m);
  if (recipient === m.sender) return conn.reply(m.chat, '😆 لا يمكنك إهداء شخصية لنفسك.', m);

  try {
    const { rows } = await m.db.query(
      'SELECT id, name, claimed_by FROM characters WHERE LOWER(name) = $1 AND claimed_by = $2',
      [characterName.toLowerCase(), m.sender]
    );
    const character = rows[0];

    if (!character) {
      const { rows: exists } = await m.db.query(
        'SELECT name FROM characters WHERE LOWER(name) = $1',
        [characterName.toLowerCase()]
      );
      if (!exists[0]) return conn.reply(m.chat, `❌ لم يتم العثور على الشخصية "${characterName}".`, m);
      return conn.reply(m.chat, `❌ أنت لست مالك *${characterName}*. فقط المالك يمكنه إهداؤها.`, m);
    }

    await m.db.query('UPDATE characters SET claimed_by = $1 WHERE id = $2', [recipient, character.id]);

    return conn.reply(
      m.chat,
      `🎁 لقد أهديت *${character.name}* إلى @${recipient.split('@')[0]}!`,
      m,
      { mentions: [recipient] }
    );
  } catch (e) {
    return conn.reply(m.chat, '❌ حدث خطأ أثناء تنفيذ العملية.', m);
  }
}

handler.help = ['اهدي @الشخص اسم_الشخصية'];
handler.tags = ['gacha'];
handler.command = ['اهدي']; // اختصار الأمر
handler.register = true;

export default handler;
