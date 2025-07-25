import fg from 'api-dylux';
import fetch from 'node-fetch';
import axios from 'axios';
const userMessages = new Map();
const userRequests = {};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال رابط فيديو من فيسبوك لتحميله\n• مثال: ${usedPrefix + command} https://www.facebook.com/share/r/1E1RojVvdJ/`);
  if (!args[0].match(/www.facebook.com|fb.watch/g)) return m.reply(`⚠️ الرابط غير صالح، يرجى إدخال رابط صحيح من فيسبوك\n• مثال: ${usedPrefix + command} https://www.facebook.com/share/r/1E1RojVvdJ/`);
  
  if (userRequests[m.sender]) return await conn.reply(m.chat, `⚠️ مهلاً @${m.sender.split('@')[0]}، أنت تقوم بتحميل فيديو بالفعل 🙄\nيرجى الانتظار حتى انتهاء التحميل الحالي قبل طلب آخر...`, m);

  userRequests[m.sender] = true;
  m.react(`⌛`);

  try {
    const downloadAttempts = [
      async () => {
        const api = await fetch(`https://api.agatz.xyz/api/facebook?url=${args[0]}`);
        const data = await api.json();
        const videoUrl = data.data.hd || data.data.sd;
        const imageUrl = data.data.thumbnail;
        if (videoUrl && videoUrl.endsWith('.mp4')) {
          return { type: 'video', url: videoUrl, caption: '✅ تم تحميل فيديو فيسبوك بنجاح' };
        } else if (imageUrl && (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.png'))) {
          return { type: 'image', url: imageUrl, caption: '✅ تم تحميل صورة من فيسبوك' };
        }
      },
      async () => {
        const api = await fetch(`${info.fgmods.url}/downloader/fbdl?url=${args[0]}&apikey=${info.fgmods.key}`);
        const data = await api.json();
        const downloadUrl = data.result[0].hd || data.result[0].sd;
        return { type: 'video', url: downloadUrl, caption: '✅ تم تحميل فيديو فيسبوك بنجاح' };
      },
      async () => {
        const apiUrl = `${info.apis}/download/facebook?url=${args[0]}`;
        const apiResponse = await fetch(apiUrl);
        const delius = await apiResponse.json();
        const downloadUrl = delius.urls[0].hd || delius.urls[0].sd;
        return { type: 'video', url: downloadUrl, caption: '✅ تم تحميل فيديو فيسبوك بنجاح' };
      },
      async () => {
        const apiUrl = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(args[0])}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const hdUrl = data.result.hd;
        const sdUrl = data.result.sd;
        const downloadUrl = hdUrl || sdUrl;
        return { type: 'video', url: downloadUrl, caption: '✅ تم تحميل فيديو فيسبوك بنجاح' };
      },
      async () => {
        const ress = await fg.fbdl(args[0]);
        const urll = ress.data[0].url;
        return { type: 'video', url: urll, caption: '✅ تم تحميل فيديو فيسبوك بنجاح' };
      }
    ];

    let mediaData = null;
    for (const attempt of downloadAttempts) {
      try {
        mediaData = await attempt();
        if (mediaData) break;
      } catch (err) {
        console.error(`خطأ في المحاولة: ${err.message}`);
        continue;
      }
    }

    if (!mediaData) throw new Error('لم يتمكن البوت من تحميل الفيديو أو الصورة من أي مصدر.');
    const fileName = mediaData.type === 'video' ? 'facebook_video.mp4' : 'facebook_image.jpg';
    await conn.sendFile(m.chat, mediaData.url, fileName, mediaData.caption, m);
    m.react('✅');
  } catch (e) {
    m.react('❌');
    console.log(e);
    m.reply(`❌ حدث خطأ أثناء التحميل: ${e.message}`);
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['فيسبوك', 'fb', 'تحميل_فيسبوك'];
handler.tags = ['downloader'];
handler.command = /^(فيسبوك|fb|facebook|facebookdl|تحميلفيسبوك)$/i;
handler.register = true;

export default handler;

// هذه دالة إضافية لا تخص فيسبوك بل انستغرام - يمكن حذفها أو استخدامها لاحقًا
async function igeh(url_media) {
  return new Promise(async (resolve, reject) => {
    const BASE_URL = 'https://instasupersave.com/';
    try {
      const resp = await axios(BASE_URL);
      const cookie = resp.headers['set-cookie'];
      const session = cookie[0].split(';')[0].replace('XSRF-TOKEN=', '').replace('%3D', '');
      const config = {
        method: 'post',
        url: `${BASE_URL}api/convert`,
        headers: {
          'origin': 'https://instasupersave.com',
          'referer': 'https://instasupersave.com/pt/',
          'user-agent': 'Mozilla/5.0',
          'x-xsrf-token': session,
          'Content-Type': 'application/json',
          'Cookie': `XSRF-TOKEN=${session}; instasupersave_session=${session}`
        },
        data: { url: url_media }
      };
      axios(config).then(response => {
        const ig = [];
        if (Array.isArray(response.data)) {
          response.data.forEach(post => {
            ig.push(post.sd === undefined ? post.thumb : post.sd.url);
          });
        } else {
          ig.push(response.data.url[0].url);
        }
        resolve({ results_number: ig.length, url_list: ig });
      }).catch(error => {
        reject(error.message);
      });
    } catch (e) {
      reject(e.message);
    }
  });
}
