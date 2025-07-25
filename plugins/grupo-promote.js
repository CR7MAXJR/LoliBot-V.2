const handler = async (m, { conn, usedPrefix, text }) => {
  if (isNaN(text) && !text.match(/@/g)) {
    // لا شيء هنا لأن التحقق سلبي
  } else if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  if (!text && !m.quoted) {
    return conn.reply(m.chat, `*⚠️ من تريد أن تعطيه صلاحيات المشرف؟*\nيرجى الإشارة إلى شخص، لست عرّافًا 😅`, m);
  }

  if (number.length > 13 || (number.length < 11 && number.length > 0)) {
    return conn.reply(m.chat, `*⚠️ الرقم الذي أدخلته غير صحيح!*\nيرجى إدخال رقم صحيح أو ببساطة الإشارة إلى المستخدم @user`, m);
  }

  try {
    if (text) {
      var user = number + '@s.whatsapp.net';
    } else if (m.quoted.sender) {
      var user = m.quoted.sender;
    } else if (m.mentionedJid) {
      var user = number + '@s.whatsapp.net';
    }
  } catch (e) {
    // يمكن ترك الكتلة فارغة أو تسجيل الخطأ
  } finally {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
    conn.reply(m.chat, `*[ ✅ ] تم ترقية العضو إلى مشرف بنجاح*`, m);
  }
};

handler.help = ['*593xxx*', '*@usuario*', '*responder chat*'].map(v => 'promote ' + v);
handler.tags = ['group'];
handler.command = /^(promote|daradmin|darpoder|ترقية)$/i; // تمت إضافة "ترقية"
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;
handler.register = true;

export default handler;
