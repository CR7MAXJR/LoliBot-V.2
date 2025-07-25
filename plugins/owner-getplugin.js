import fs from 'fs';
import fuzzysort from 'fuzzysort';  

let handler = async (m, { usedPrefix, command, text }) => {
  let الملفات = Object.keys(plugins);
  let الأوامر = الملفات.map(v => v.replace('.js', ''));

  if (!text) return m.reply(`*📦 ماذا تريد أن أبحث؟*\n\n📌 مثال:\n${usedPrefix + command} sticker`);

  let النتائج = fuzzysort.go(text, الأوامر);

  if (النتائج.length === 0) {
    return m.reply(`❌ لم أجد: '${text}'\n\n🧠 ربما تقصد:\n${الأوامر.map(v => '🔹 ' + v).join`\n`}`);
  }

  let المطابقة = النتائج[0].target;
  m.reply(fs.readFileSync('./plugins/' + المطابقة + '.js', 'utf-8'));
};

handler.help = ['جلب <نص>'];
handler.tags = ['المالك'];
handler.command = /^جلب$/i;
handler.rowner = true;

export default handler;
