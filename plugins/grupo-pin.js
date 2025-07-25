let handler = async (m, { conn, command }) => {
  if (!m.quoted)
    return m.reply(`⚠️ قم بالرد على رسالة لـ ${
      command === 'تثبيت'
        ? 'تثبيتها'
        : command === 'الغاء_تثبيت'
        ? 'إلغاء تثبيتها'
        : command === 'تمييز'
        ? 'تمييزها'
        : 'إلغاء تمييزها'
    }.`);

  try {
    let messageKey = {
      remoteJid: m.chat,
      fromMe: m.quoted.fromMe,
      id: m.quoted.id,
      participant: m.quoted.sender,
    };

    if (command === 'تثبيت') {
      await conn.sendMessage(m.chat, { pin: messageKey, type: 1, time: 604800 });
      m.react("✅️");
    }

    if (command === 'الغاء_تثبيت') {
      await conn.sendMessage(m.chat, { pin: messageKey, type: 2, time: 86400 });
      m.react("✅️");
    }

    if (command === 'تمييز') {
      await conn.sendMessage(m.chat, { keep: messageKey, type: 1, time: 15552000 });
      m.react("✅️");
    }

    if (command === 'الغاء_تمييز') {
      await conn.sendMessage(m.chat, { keep: messageKey, type: 2, time: 86400 });
      m.react("✅️");
    }
  } catch (error) {
    console.error(error);
  }
};

handler.help = ['تثبيت', 'الغاء_تثبيت', 'تمييز', 'الغاء_تمييز'];
handler.tags = ['group'];
handler.command = ['تثبيت', 'الغاء_تثبيت', 'تمييز', 'الغاء_تمييز'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
