import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  const defaultLang = 'es'; // اللغة الافتراضية: الإسبانية

  if (!args || !args[0]) return m.reply(`⚠️ *الاستخدام الصحيح للأمر:*  
» ${usedPrefix + command} (رمز اللغة الهدف) (النص المراد ترجمته)

📌 *أمثلة:*
• ${usedPrefix + command} es Hello » الإسبانية
• ${usedPrefix + command} en مرحبًا » الإنجليزية
• ${usedPrefix + command} fr buenos días » الفرنسية
• ${usedPrefix + command} pt tudo bem » البرتغالية
• ${usedPrefix + command} de cómo estás » الألمانية
• ${usedPrefix + command} it buongiorno » الإيطالية`);

  let lang = args[0];
  let text = args.slice(1).join(' ');

  if ((lang || '').length !== 2) {
    text = args.join(' ');
    lang = defaultLang;
  }

  if (!text && m.quoted && m.quoted.text) text = m.quoted.text;

  if (!text) return m.reply('⚠️ لم يتم تحديد أي نص للترجمة.');

  try {
    const res = await fetch("https://tr.skyultraplus.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: lang,
        format: "text",
        alternatives: 3,
        api_key: ""
      }),
      headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();

    if (!json || !json.translatedText) throw '❌ فشل في الترجمة.';

    await m.reply(`*🔤 الترجمة:*\n${json.translatedText}`);
  } catch (e) {
    console.error(e);
    await m.reply('*❌ حدث خطأ، يرجى المحاولة لاحقًا.*');
  }
};

handler.help = ['ترجم'];
handler.tags = ['أدوات'];
handler.command = /^(ترجم)$/i;
handler.register = true;

export default handler;
