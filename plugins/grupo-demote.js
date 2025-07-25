const handler = async (m, { conn, usedPrefix, text }) => {
  if (isNaN(text) && !text.match(/@/g)) {
  } else if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  if (!text && !m.quoted)
    return conn.reply(
      m.chat,
      `*⚠️ لمن تريد إزالة الصلاحيات؟* رجاءً قم بذكر المستخدم، لست عرّافًا :)`,
      m
    );

  if (number.length > 13 || (number.length < 11 && number.length > 0))
    return conn.reply(
      m.chat,
      `*🤓 الرقم الذي أدخلته غير صحيح.* يرجى إدخال الرقم بشكل صحيح أو ببساطة قم بذكر المستخدم.`,
      m
    );

  try {
    if (text) {
      var user = number + '@s.whatsapp.net';
    } else if (m.quoted.sender) {
      var user = m.quoted.sender;
    } else if (m.mentionedJid) {
      var user = number + '@s.whatsapp.net';
    }
  } catch (e) {
  } finally {
    conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    conn.reply(m.chat, `*[ ✅ ] تم تنفيذ الأمر بنجاح، تم إزالة الصلاحيات.*`, m);
  }
};

handler.help = ['*593xxx*', '*@usuario*', '*responder chat*'].map((v) => 'سحب ' + v);
handler.tags = ['group'];
handler.command = /^(demote|quitarpoder|quitaradmin|سحب)$/i; // ← أضفنا "سحب"
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;
handler.fail = null;

export default handler;
