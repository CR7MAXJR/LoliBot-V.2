import fetch from 'node-fetch';
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const userCaptions = new Map();
const userRequests = {};

let handler = async (m, { args, usedPrefix, command, conn }) => {
  if (!args[0]) throw `*⚠️ الرجاء إدخال رابط لمستودع GitHub*\n• *مثال :* ${usedPrefix + command} https://github.com/elrebelde21/LoliBot-MD`;

  if (!regex.test(args[0])) return m.reply(`⚠️ هذا ليس رابط GitHub صالح 😒`);

  if (userRequests[m.sender]) {
    conn.reply(m.chat, `⏳ *يا @${m.sender.split('@')[0]} انتظر...* هناك طلب جارٍ بالفعل. يرجى الانتظار حتى ينتهي قبل إرسال طلب جديد.`, userCaptions.get(m.sender) || m);
    return;
  }

  userRequests[m.sender] = true;

  try {
    const downloadGit = await conn.reply(m.chat, `*⌛ جاري تجهيز المستودع لتحميله لك... 🚀*\n*إذا لم يصلك الملف، فقد يكون حجم المستودع كبيرًا جدًا.*`, m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: null,
          mediaType: 1,
          description: null,
          title: info.wm,
          body: ' 💫 بوت واتساب خارق 🥳 ',
          previewType: 0,
          thumbnail: m.pp,
          sourceUrl: info.nna
        }
      }
    });

    userCaptions.set(m.sender, downloadGit);

    let [_, user, repo] = args[0].match(regex) || [];
    repo = repo.replace(/.git$/, '');
    let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
    let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];

    await conn.sendFile(m.chat, url, filename, null, m);
  } catch (e) {
    m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *أرسل هذا الخطأ إلى المطور باستخدام الأمر:* #ابلاغ\n\n>>> ${e} <<<`);
    console.log(e);
    handler.limit = 0; // ❌ لا يستهلك الماس إذا فشل الأمر
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['تحميل_ريبو <رابط>'];
handler.tags = ['التحميل'];
handler.command = /تحميل_ريبو|تحميل_مستودع|استنساخ_ريبو|gitclone/i;
handler.register = true;
handler.limit = 2;
handler.level = 1;

export default handler;
