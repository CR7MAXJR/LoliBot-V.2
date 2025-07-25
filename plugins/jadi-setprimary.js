const handler = async (m, { conn, args, participants, isAdmin, isGroup, command }) => {
const mentioned = m.mentionedJid?.[0];

if (!mentioned) {
  try {
    await m.db.query("UPDATE group_settings SET primary_bot = NULL WHERE group_id = $1", [m.chat]);
    await m.reply("✅ تم *إلغاء تعيين البوت الرئيسي* في هذه المجموعة. الآن يمكن لأي بوت فرعي الرد.");
  } catch (err) {
    console.error(err);
  }
  return;
}

const botId = conn.user?.id.replace(/:\d+/, "");
const selectedId = mentioned.replace(/:\d+/, "").replace("@s.whatsapp.net", "");

if (selectedId !== botId) {
  try {
    await conn.sendMessage(m.chat, {
      text: `✅ تم تعيين البوت @${selectedId} كـ *البوت الرئيسي* لهذه المجموعة.`,
      mentions: [mentioned]
    }, { quoted: m });
    await m.db.query("UPDATE group_settings SET primary_bot = $1 WHERE group_id = $2", [mentioned, m.chat]);
  } catch (err) {
    console.error(err);
  }
} else {
  await m.db.query("UPDATE group_settings SET primary_bot = $1 WHERE group_id = $2", [botId + "@s.whatsapp.net", m.chat]);
  await m.reply("✅ تم تعيين نفسك كبوت رئيسي في هذه المجموعة.");
}
};

handler.help = ['تعيين'];
handler.tags = ['بوتات'];
handler.command = /^تعيين$/i;
handler.group = true;
handler.admin = true;

export default handler;
