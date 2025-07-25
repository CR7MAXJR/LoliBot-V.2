import fg from 'api-dylux';
import axios from 'axios';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
const userRequests = {};

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
if (!text) return m.reply(`⚠️ *ما الذي تريد تحميله من تيك توك؟*\n\n🎯 *أرسل رابط فيديو من TikTok لتحميله بدون علامة مائية.*\n🔗 *مثال:* ${usedPrefix + command} https://vm.tiktok.com/ZM6T4X1RY/`);
if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) return m.reply(`❌ *الرابط غير صحيح أو لا يخص TikTok*`);
if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ @${m.sender.split('@')[0]}، الرجاء الانتظار حتى ينتهي التحميل الحالي قبل طلب جديد.`, m);

userRequests[m.sender] = true;

const { key } = await conn.sendMessage(m.chat, { text: `⌛ جاري معالجة رابط التيك توك الخاص بك...\n▰▰▰▱▱▱▱▱▱` }, { quoted: m });

await delay(1000);
await conn.sendMessage(m.chat, { text: `⌛ جاري التحميل...\n▰▰▰▰▰▱▱▱▱`, edit: key });
await delay(1000);
await conn.sendMessage(m.chat, { text: `⌛ اقتربنا من الانتهاء...\n▰▰▰▰▰▰▰▱▱`, edit: key });

try {
  const downloadAttempts = [
    async () => {
      const tiktok = await tiktokdlF(args[0]);
      return tiktok.video;
    },
    async () => {
      const response = await axios.get(`https://api.dorratz.com/v2/tiktok-dl?url=${args[0]}`);
      return response.data.data.media.org;
    },
    async () => {
      const result = await fg.tiktok(args[0]);
      return result.nowm;
    }
  ];

  let videoUrl = null;

  for (const attempt of downloadAttempts) {
    try {
      videoUrl = await attempt();
      if (videoUrl) break;
    } catch (err) {
      console.error(`خطأ أثناء المحاولة: ${err.message}`);
      continue;
    }
  }

  if (!videoUrl) throw new Error('فشل تحميل الفيديو من جميع المصادر.');

  await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', '*✅ تم التحميل بنجاح، إليك الفيديو الخاص بك بدون علامة مائية.*', m);
  await conn.sendMessage(m.chat, { text: `✅ تم الانتهاء.\n▰▰▰▰▰▰▰▰▰`, edit: key });

} catch (e) {
  console.log(e);
  m.react(`❌`);
  handler.limit = false;
} finally {
  delete userRequests[m.sender];
}
};

handler.help = ['تحميل_تيك', 'تيك_بدونعلامة'];
handler.tags = ['downloader'];
handler.command = /^(تحميل_تيك|تيك_بدونعلامة|tt|tiktok)(dl|nowm)?$/i;
handler.limit = 1;

export default handler;

const delay = time => new Promise(res => setTimeout(res, time));

// دالة خاصة بموقع tikdown.org لتحميل الفيديوهات
async function tiktokdlF(url) {
  const gettoken = await axios.get('https://tikdown.org/id');
  const $ = cheerio.load(gettoken.data);
  const token = $('#download-form > input[type=hidden]:nth-child(2)').attr('value');
  const param = { url: url, _token: token };

  const { data } = await axios.request('https://tikdown.org/getAjax?', {
    method: 'post',
    data: new URLSearchParams(Object.entries(param)),
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) Chrome/100.0.4896.88 Safari/537.36'
    }
  });

  const getdata = cheerio.load(data.html);
  if (data.status) {
    return {
      status: true,
      thumbnail: getdata('img').attr('src'),
      video: getdata('div.download-links > div:nth-child(1) > a').attr('href'),
      audio: getdata('div.download-links > div:nth-child(2) > a').attr('href')
    };
  } else {
    return { status: false };
  }
}
