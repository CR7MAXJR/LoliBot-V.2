import fs from 'fs';
import acrcloud from 'acrcloud';

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const handler = async (m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (/audio|video/.test(mime)) {
    if ((q.msg || q).seconds > 20)
      return m.reply('⚠️ الملف كبير جدًا، يُفضل أن يكون من 10 إلى 20 ثانية لتحديد الأغنية بدقة.');

    const media = await q.download();
    const ext = mime.split('/')[1];
    const filePath = `./tmp/${m.sender}.${ext}`;
    fs.writeFileSync(filePath, media);

    const res = await acr.identify(fs.readFileSync(filePath));
    const { code, msg } = res.status;

    if (code !== 0) throw msg;

    const { title, artists, album, genres, release_date } = res.metadata.music[0];
    const resultado = `*📌 نتائج البحث:*\n
• 🎵 *العنوان:* ${title}
• 👤 *الفنان:* ${artists ? artists.map(v => v.name).join(', ') : 'غير معروف'}
• 💽 *الألبوم:* ${album?.name || 'غير معروف'}
• 🎶 *النوع:* ${genres ? genres.map(v => v.name).join(', ') : 'غير معروف'}
• 📅 *تاريخ الإصدار:* ${release_date || 'غير معروف'}
    `.trim();

    fs.unlinkSync(filePath);
    m.reply(resultado);

  } else {
    throw '*⚠️ من فضلك رد على رسالة صوتية أو فيديو يحتوي على موسيقى.*';
  }
};

handler.help = ['ماالاغنية'];
handler.tags = ['tools'];
handler.command = /^ماالاغنية|ماالأغنية|ماالاغنيه|ما-الاغنية$/i;
handler.register = true;

export default handler;
