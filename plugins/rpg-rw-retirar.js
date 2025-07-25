let handler = async (m, { conn, text }) => {
  if (!m.db) return;

  const characterName = text.trim().toLowerCase();
  if (!characterName) return conn.reply(m.chat, '⚠️ من فضلك، اكتب اسم الشخصية التي تريد سحبها من السوق.', m);

  try {
    const { rows } = await m.db.query(
      'SELECT * FROM characters WHERE LOWER(name) = $1 AND seller = $2 AND for_sale = true',
      [characterName, m.sender]
    );
    const characterToRemove = rows[0];

    if (!characterToRemove) {
      const { rows: exists } = await m.db.query(
        'SELECT * FROM characters WHERE LOWER(name) = $1',
        [characterName]
      );

      if (!exists[0]) 
        return conn.reply(m.chat, `❌ لم يتم العثور على أي شخصية بالاسم: *${characterName}*.`, m);

      if (exists[0].seller !== m.sender) 
        return conn.reply(m.chat, `❌ لا يمكنك سحب هذه الشخصية لأنك لست البائع.`, m);

      return conn.reply(m.chat, `❌ الشخصية *${characterName}* غير معروضة للبيع حاليًا.`, m);
    }

    await m.db.query(
      'UPDATE characters SET for_sale = false, seller = null, last_removed_time = $1 WHERE id = $2',
      [Date.now(), characterToRemove.id]
    );

    return conn.reply(m.chat, `✅ تم سحب الشخصية *${characterToRemove.name}* من السوق بنجاح.`, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء سحب الشخصية. حاول مرة أخرى لاحقًا.', m);
  }
};

handler.help = ['سحب'];
handler.tags = ['gacha'];
handler.command = ['سحب'];
handler.register = true;

export default handler;
