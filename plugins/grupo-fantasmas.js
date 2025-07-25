switch (command) {
  case 'fantasmas':
  case 'الخيالات':
    if (total === 0) return m.reply(`⚠️ هذه المجموعة نشطة، لا توجد خيالات! :D`);
    let teks = `⚠️ فحص الأعضاء غير النشطين ⚠️\n\n`;
    teks += `اسم المجموعة: ${metadata.subject || 'بدون اسم'}\n`;
    teks += `*عدد الأعضاء:* ${memberData.length}\n`;
    teks += `*عدد الخيالات:* ${total}\n\n`;
    teks += `[ 👻 قائمة الخيالات 👻 ]\n`;
    teks += sider.map(v => `  👉🏻 @${v.id.split('@')[0]}`).join('\n');
    teks += `\n\n*ملاحظة:* هذه القائمة قد لا تكون دقيقة 100٪. البوت يحسب الرسائل من وقت إضافته فقط.`;
    await conn.sendMessage(m.chat, { text: teks, contextInfo: { mentionedJid: sider.map(v => v.id) }}, { quoted: m });
    break;

  case 'kickfantasmas':
  case 'طردالخيالات':
    if (total === 0) return m.reply(`⚠️ هذه المجموعة نشطة، لا توجد خيالات! :D`);
    let kickTeks = `⚠️ طرد الأعضاء غير النشطين ⚠️\n\n`;
    kickTeks += `اسم المجموعة: ${metadata.subject || 'بدون اسم'}\n`;
    kickTeks += `*عدد الأعضاء:* ${memberData.length}\n`;
    kickTeks += `*عدد الخيالات:* ${total}\n\n`;
    kickTeks += `[ 👻 الخيالات التي سيتم طردها 👻 ]\n`;
    kickTeks += sider.map(v => `@${v.id.split('@')[0]}`).join('\n');
    kickTeks += `\n\n*سيبدأ البوت بالطرد بعد 20 ثانية، بين كل طرد 10 ثوانٍ.*`;
    await conn.sendMessage(m.chat, { text: kickTeks, contextInfo: { mentionedJid: sider.map(v => v.id) }}, { quoted: m });

    let chatSettings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [m.chat])).rows[0] || {};
    let originalWelcome = chatSettings.welcome || true;
    await db.query(`UPDATE group_settings SET welcome = false WHERE group_id = $1`, [m.chat]);
    await delay(20000);
    try {
      for (let user of sider) {
        if (user.id !== conn.user.jid) {
          await conn.groupParticipantsUpdate(m.chat, [user.id], 'remove');
          await delay(10000);
        }
      }
    } finally {
      await db.query(`UPDATE group_settings SET welcome = $1 WHERE group_id = $2`, [originalWelcome, m.chat]);
    }
    await m.reply(`✅ تم طرد جميع الخيالات بنجاح.`);
    break;

  default:
    // Handle other commands or do nothing
    break;
}
