import uploadFile, { quax, RESTfulAPI, catbox, uguu, filechan, pixeldrain, gofile, krakenfiles, telegraph } from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime) throw `*⚠️ لم يتم العثور على صورة أو فيديو!*

📌 *طريقة الاستخدام:*
— قم بالرد على صورة أو ملصق أو فيديو قصير، ثم اكتب الأمر:

➔ *${usedPrefix + command}*

سيقوم البوت تلقائيًا برفع الملف إلى أحد المواقع التالية:
*qu.ax*, *catbox*, *gofile*, وغيرها.

🌐 *هل ترغب في اختيار موقع معين؟*
يمكنك استخدام:

➔ *${usedPrefix + command} quax* _(مُوصى به)_
➔ *${usedPrefix + command} catbox* _(مُوصى به)_
➔ *${usedPrefix + command} uguu*  
➔ *${usedPrefix + command} pixeldrain*  
➔ *${usedPrefix + command} restfulapi*  
➔ *${usedPrefix + command} filechan*  
➔ *${usedPrefix + command} gofile*  
➔ *${usedPrefix + command} krakenfiles*  
➔ *${usedPrefix + command} telegraph*

📝 *ملاحظات:*
- يجب أن يكون الملف صورة، ملصق أو فيديو قصير.
- روابط مثل qu.ax و catbox لا تنتهي صلاحيتها.
- بعض المواقع مثل file.io تنتهي روابطها خلال 24 ساعة.
`;

  const media = await q.download();
  const option = (args[0] || '').toLowerCase();
  const services = { quax, restfulapi: RESTfulAPI, catbox, uguu, filechan, pixeldrain, gofile, krakenfiles, telegraph };

  try {
    if (option && services[option]) {
      const link = await services[option](media);
      return m.reply(link);
    }

    const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    const link = await (isTele ? uploadImage : uploadFile)(media);
    return m.reply(link);

  } catch (e) {
    console.error(e);
    throw '❌ حدث خطأ أثناء رفع الملف. جرب خيارًا آخر من القائمة:\n' + Object.keys(services).map(v => `➔ ${usedPrefix}${command} ${v}`).join('\n');
  }
};

handler.help = ['رفع <اختياري: اسم الموقع>'];
handler.tags = ['أدوات'];
handler.command = /^(رفع|رابط|upload|tourl)$/i;
handler.register = true;

export default handler;
