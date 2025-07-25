import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  const notStickerMessage = `*⚠️ من فضلك قم بالرد على ملصق (sticker) تريد تحويله إلى صورة باستخدام الأمر التالي:* ${usedPrefix + command}`;
  
  if (!m.quoted) throw notStickerMessage;
  
  const q = m.quoted;
  const mime = q?.mimetype || '';
  
  if (!mime.includes('webp')) throw notStickerMessage;

  m.reply(`⌛ جاري تحويل الملصق إلى صورة...`);

  const media = await q.download();
  const out = await webp2png(media).catch(() => null) || Buffer.alloc(0);

  await conn.sendFile(m.chat, out, 'sticker.png', null, m);
};

handler.help = ['toimg (رد على ملصق)'];
handler.tags = ['تحويل'];
handler.command = ['toimg', 'jpg', 'img']; // يمكنك أيضًا إضافة ['الىصورة'] إن أردت أمرًا عربيًا
handler.register = true;

export default handler;
