import { toAudio } from '../lib/converter.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';

  if (!/video|audio/.test(mime))
    throw `*⚠️ من فضلك رد على فيديو أو ملاحظة صوتية لتحويلها إلى MP3*`;

  const media = await q.download();
  if (!media)
    throw '*⚠️ حدث خطأ أثناء تحميل الوسائط، حاول مرة أخرى لاحقًا.*';

  m.reply(`🔄 جاري تحويل الملف من فيديو إلى صوت MP3، يرجى الانتظار...`);

  const audio = await toAudio(media, 'mp4');
  if (!audio.data)
    throw '*⚠️ فشل التحويل! تأكد أنك رددت على فيديو أو ملاحظة صوتية بشكل صحيح.*';

  await conn.sendMessage(
    m.chat,
    {
      audio: audio.data,
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {}
    },
    { quoted: m }
  );
};

handler.help = ['صوت'];
handler.tags = ['محول'];
handler.command = /^صوت$/i;
handler.register = true;

export default handler;
