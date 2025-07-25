import { googleImage } from '@bochilteam/scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`⚠️ ماذا تريد أن أبحث؟ 🤔️\n\n📌 *طريقة الاستخدام:*\n${usedPrefix + command} قطة`);
  }

  // فلتر الكلمات المحظورة
  const forbiddenWords = [
    'porn', 'hentai', 'pussy', 'vagina', 'nude', 'xxx', 'rule34', 'sex', 'porno', 'futanari',
    'nsfw', 'anal', 'blowjob', 'ahegao', 'pedo', 'zoofilia', 'necrofilia', 'cp', 'masturb',
    'naked', 'nudes', 'pene', 'coño', 'ass', 'semen', 'cum', 'bdsm', 'fetish', 'milf',
    'loli', 'desnuda', 'desnudo', 'mujer sin ropa', 'sin ropa', 'chica desnuda', 'porno gay',
    'xvideos', 'pornhub', 'xnxx', 'mia khalifa', 'lana rhoades', 'sexmex', 'marsha may', 
    'violet myllers', 's3x', 'p0rn', 'h3ntai', 'نودز', 'إباحية', 'هنتاي', 'جنسية', 'لولي', 'جنس', 'مثير'
  ];

  const loweredText = text.toLowerCase();
  if (forbiddenWords.some(word => loweredText.includes(word))) {
    return m.reply('🚫 عذرًا، لا يمكنني تنفيذ هذا الطلب.');
  }

  try {
    const res = await googleImage(text);
    const image = await res.getRandom();

    // فلتر إضافي على الرابط نفسه (احتياطًا)
    if (forbiddenWords.some(word => image.toLowerCase().includes(word))) {
      return m.reply('⚠️ تم حظر نتيجة البحث لاحتوائها على محتوى غير لائق.');
    }

    const link = image;
    conn.sendFile(m.chat, link, 'resultado.jpg', `🔍 *نتيجة البحث عن:* ${text}`, m);
  } catch (e) {
    console.error(e);
    m.reply('❌ حدث خطأ أثناء البحث، حاول مرة أخرى.');
  }
};

handler.help = ['gimage <كلمة>', 'imagen <كلمة>', 'صورة <كلمة>'];
handler.tags = ['بحث'];
handler.command = /^(gimage|image|imagen|صورة)$/i;
handler.register = true;
handler.limit = 1;

export default handler;
