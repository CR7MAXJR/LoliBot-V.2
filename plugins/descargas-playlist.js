import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (!text) return m.reply(`*⚠️ ماذا تريد أن تبحث؟*\nاكتب اسم المقطع.\n\n*📌 مثال:*\n*${usedPrefix + command}* عمرو دياب`);
  
  m.react('📀');

  let result = await yts(text);
  let ytres = result.videos;

  if (!ytres.length) return m.reply('❌ لم يتم العثور على نتائج.');

  let textoo = `*🔎 نتائج البحث عن:* ${text}\n\n`;

  for (let i = 0; i < Math.min(15, ytres.length); i++) {
    let v = ytres[i];
    textoo += `🎵 *العنوان:* ${v.title}\n📆 *منذ:* ${v.ago}\n👀 *عدد المشاهدات:* ${v.views}\n⌛ *المدة:* ${v.timestamp}\n🔗 *الرابط:* ${v.url}\n\n⊱ ────── {.⋅ ♫ ⋅.} ───── ⊰\n\n`;
  }

  await conn.sendFile(m.chat, ytres[0].image, 'thumbnail.jpg', textoo, m);
};

handler.help = ['بحث_يوتيوب', 'قائمة_تشغيل', 'يوتيوب'];
handler.tags = ['downloader'];
handler.command = ['بحث_يوتيوب', 'قائمة_تشغيل', 'يوتيوب', 'playvid2', 'playlist', 'playlista', 'yts', 'ytsearch'];
handler.register = true;

export default handler;
