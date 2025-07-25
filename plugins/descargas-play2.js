// استيراد المكتبات المطلوبة
//import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { تنزيل_يوتيوب } from '../lib/yt-savetube.js';
import { تنزيل_صوت_يوتيوب } from '../lib/youtubedl.js';
import { تنزيل_أمدل, تنزيل_يوت } from '../lib/scraper.js';

const طلبات_المستخدم = {};

let معالج = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply('*🤔 ماذا تبحث عنه؟ أدخل رابط يوتيوب لتنزيل الصوت*');

  const نوع_الإرسال = command.includes('مستند') ? 'document' : command.includes('mp3') ? 'audio' : 'video';
  const نتائج_تشغيل = await بحث(args.join(' '));
  let رابط_يوتيوب = '';
  if (args[0].includes('you')) {
    رابط_يوتيوب = args[0];
  } else {
    const فهرس = parseInt(args[0]) - 1;
    if (فهرس >= 0) {
      if (Array.isArray(global.videoList) && global.videoList.length > 0) {
        const عنصر_مطابق = global.videoList.find(item => item.from === m.sender);
        if (عنصر_مطابق) {
          if (فهرس < عنصر_مطابق.urls.length) {
            رابط_يوتيوب = عنصر_مطابق.urls[فهرس];
          } else {
            return m.reply(`⚠️ *لم يتم العثور على رابط لهذا الرقم، أدخل رقمًا بين 1 و${عنصر_مطابق.urls.length}*`);
          }
        }
      }
    }
  }

  if (طلبات_المستخدم[m.sender]) {
    return m.reply('⏳ *انتظر...* هناك طلب قيد المعالجة. من فضلك، انتظر حتى ينتهي قبل تقديم طلب آخر.');
  }
  طلبات_المستخدم[m.sender] = true;

  try {
    if (command == 'صوت_يوتيوب' || command == 'صوت_إف_جي' || command == 'صوت_يوتيوب_مستند') {
      m.reply([
        `*⌛ انتظر ✋ لحظة... جارٍ تنزيل الصوت الخاص بك 🍹*`,
        `*⌛ جارٍ المعالجة...\nأحاول تنزيل الصوت، انتظر 🏃‍♂️💨*`,
        `*اهدأ، أنا أبحث عن أغنيتك 😎*\n\n*تأكد من كتابة اسم الأغنية أو رابط فيديو يوتيوب بشكل صحيح*\n\n> *إذا لم يعمل الأمر تشغيل، استخدم الأمر صوت_يوتيوب*`
      ].getRandom());

      try {
        const هل_صوت = command.toLowerCase().includes('mp3') || command.toLowerCase().includes('audio');
        const تنسيق = هل_صوت ? 'mp3' : '720';
        const نتيجة = await تنزيل_يوتيوب(args[0], تنسيق);
        const بيانات = نتيجة.result;
        await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: بيانات.download }, mimetype: 'audio/mpeg', fileName: `صوت.mp3`, contextInfo: {} }, { quoted: m });
      } catch {
        try {
          const تنسيق = args[1] || '720p';
          const استجابة = await تنزيل_أمدل(args[0], تنسيق);
          const { العنوان, النوع, التنزيل, الصورة_الصغيرة } = استجابة.result;
          if (النوع === 'audio') {
            await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: التنزيل }, mimetype: 'audio/mpeg', fileName: `${العنوان}.mp3`, contextInfo: {} }, { quoted: m });
          }
        } catch {
          try {
            const تنسيق = args[1] || 'mp3';
            const استجابة = await تنزيل_يوت(args[0], تنسيق);
            const { العنوان, النوع, التنزيل, الصورة_الصغيرة } = استجابة;
            if (النوع === 'audio') {
              await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: التنزيل }, mimetype: 'audio/mpeg', fileName: `${العنوان}.mp3`, contextInfo: {} }, { quoted: m });
            }
          } catch {
            try {
              const استجابة = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${args}`);
              let { data } = await استجابة.json();
              await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: data.dl }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
            } catch {
              try {
                const استجابة = await fetch(`https://api.agatz.xyz/api/ytmp3?url=${args}`);
                let بيانات = await استجابة.json();
                await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: بيانات.data.downloadUrl }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
              } catch {
                try {
                  const استجابة = await fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${args}`);
                  let { result } = await استجابة.json();
                  await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: await result.download.url }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
                } catch {
                  try {
                    const رابط_واجهة = `${info.apis}/download/ytmp3?url=${args}`;
                    const استجابة_واجهة = await fetch(رابط_واجهة);
                    const بيانات_ديليوس = await استجابة_واجهة.json();

                    if (!بيانات_ديليوس.status) {
                      return m.react("❌");
                    }
                    const رابط_التنزيل = بيانات_ديليوس.data.download.url;
                    await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: رابط_التنزيل }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
                  } catch {
                    try {
                      let جودة = '128kbps';
                      let رابط = رابط_يوتيوب;
                      const يوتيوب = await youtubedl(رابط).catch(async _ => await youtubedlv2(رابط));
                      const رابط_التنزيل = await يوتيوب.audio[جودة].download();
                      const العنوان = await يوتيوب.title;
                      const حجم = await يوتيوب.audio[جودة].fileSizeH;
                      await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: رابط_التنزيل }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
                    } catch {
                      try {
                        let بحث_يوتيوب = await yts(رابط_يوتيوب);
                        let نتائج = بحث_يوتيوب.all.map(v => v).filter(v => v.type == "video");
                        let معلومات = await ytdl.getInfo('https://youtu.be/' + نتائج[0].videoId);
                        let تنسيق = await ytdl.chooseFormat(معلومات.formats, { filter: 'audioonly' });
                        conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: تنسيق.url }, fileName: نتائج[0].title + '.mp3', mimetype: 'audio/mp4', contextInfo: {} }, { quoted: m });
                      } catch {
                        // لا رد إضافي في حالة الفشل
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (command == 'فيديو_يوتيوب' || command == 'فيديو_إف_جي' || command == 'فيديو_يوتيوب_مستند') {
      m.reply([
        `*⌛ انتظر ✋ لحظة... جارٍ تنزيل الفيديو الخاص بك 🍹*`,
        `*⌛ جارٍ المعالجة...\nأحاول تنزيل الفيديو، انتظر 🏃‍♂️💨*`,
        `*اهدأ ✋🥸🤚*\n\n*جارٍ تنزيل الفيديو 🔄*\n\n> *انتظر لحظة من فضلك*`
      ].getRandom());

      try {
        const نتيجة = await تنزيل_يوتيوب(args[0], "720");
        const بيانات = نتيجة.result;
        await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: بيانات.download }, mimetype: 'video/mp4', fileName: `${بيانات.title}.mp4`, caption: `🔰 إليك الفيديو الخاص بك\n🔥 العنوان: ${بيانات.title}` }, { quoted: m });
      } catch {
        try {
          const [إدخال, جودة = '720'] = text.split(' ');
          const جودات_صالحة = ['240', '360', '480', '720', '1080'];
          const جودة_محددة = جودات_صالحة.includes(جودة) ? جودة : '720';
          const استجابة = await تنزيل_صوت_يوتيوب(نتائج_تشغيل[0].url, جودة_محددة, 'video');
          await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: استجابة.result.download }, mimetype: 'video/mp4', caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title} (${جودة_محددة}p)` }, { quoted: m });
        } catch {
          try {
            const تنسيق = args[1] || '720p';
            const استجابة = await تنزيل_أمدل(args[0], تنسيق);
            const { العنوان, النوع, التنزيل, الصورة_الصغيرة } = استجابة.result;
            if (النوع === 'video') {
              await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: التنزيل }, caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}`, thumbnail: الصورة_الصغيرة }, { quoted: m });
            }
          } catch {
            try {
              const تنسيق = args[1] || 'mp4';
              const استجابة = await تنزيل_يوت(args[0], تنسيق);
              const { العنوان, النوع, التنزيل, الصورة_الصغيرة } = استجابة;
              if (النوع === 'video') {
                await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: التنزيل }, caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}`, thumbnail: الصورة_الصغيرة }, { quoted: m });
              }
            } catch {
              try {
                const استجابة = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${args}`);
                let { data } = await استجابة.json();
                await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: data.dl }, fileName: `فيديو.mp4`, mimetype: 'video/mp4', caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}` }, { quoted: m });
              } catch {
                try {
                  const استجابة = await fetch(`https://api.agatz.xyz/api/ytmp4?url=${args}`);
                  let بيانات = await استجابة.json();
                  await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: بيانات.data.downloadUrl }, fileName: `فيديو.mp4`, mimetype: 'video/mp4', caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}` }, { quoted: m });
                } catch {
                  try {
                    const استجابة = await fetch(`https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${args}`);
                    let { result } = await استجابة.json();
                    await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: result.download.url }, fileName: `فيديو.mp4`, mimetype: 'video/mp4', caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}` }, { quoted: m });
                  } catch {
                    try {
                      const رابط_أكسيل = `https://axeel.my.id/api/download/video?url=${args}`;
                      const استجابة_أكسيل = await fetch(رابط_أكسيل);
                      const بيانات_أكسيل = await استجابة_أكسيل.json();
                      if (بيانات_أكسيل && بيانات_أكسيل.downloads?.url) {
                        const رابط_الفيديو = بيانات_أكسيل.downloads.url;
                        await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: رابط_الفيديو }, fileName: `${نتائج_تشغيل[0].title}.mp4`, caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}` }, { quoted: m });
                      }
                    } catch {
                      try {
                        let جودة = args[1] || '360';
                        let جودة_بكسل = جودة + 'p';
                        let رابط = رابط_يوتيوب;
                        const يوتيوب = await youtubedl(رابط).catch(async _ => await youtubedlv2(رابط));
                        const رابط_التنزيل = await يوتيوب.video[جودة_بكسل].download();
                        const العنوان = await يوتيوب.title;
                        const حجم = await يوتيوب.video[جودة_بكسل].fileSizeH;
                        await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: رابط_التنزيل }, fileName: `${العنوان}.mp4`, mimetype: 'video/mp4', caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${العنوان}`, thumbnail: await fetch(يوتيوب.thumbnail) }, { quoted: m });
                      } catch {
                        try {
                          let وسائط = await تنزيل_فيديو_يوتيوب(رابط_يوتيوب);
                          await conn.sendMessage(m.chat, { [نوع_الإرسال]: { url: وسائط.result }, fileName: `خطأ.mp4`, caption: `_${wm}_`, thumbnail: وسائط.thumb, mimetype: 'video/mp4' }, { quoted: m });
                        } catch (خطأ) {
                          console.log(خطأ);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (خطأ) {
    console.error(خطأ);
    m.react("❌️");
  } finally {
    delete طلبات_المستخدم[m.sender];
  }
};

معالج.help = ['فيديو_يوتيوب', 'صوت_يوتيوب'];
معالج.tags = ['تنزيل'];
معالج.command = /^صوت_يوتيوب|فيديو_يوتيوب|صوت_إف_جي|صوت|تنزيل_صوت|فيديو_يوتيوب_مستند|صوت_يوتيوب_مستند$/i;
export default معالج;

async function بحث(استعلام, خيارات = {}) {
  const نتائج_البحث = await yts.search({ query: استعلام, hl: 'es', gl: 'ES', ...خيارات });
  return نتائج_البحث.videos;
}

function تحويل_بايت_إلى_حجم(بايت) {
  return new Promise((resolve, reject) => {
    const أحجام = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت', 'تيرابايت'];
    if (بايت === 0) return resolve('غير متاح');
    const فهرس = parseInt(Math.floor(Math.log(بايت) / Math.log(1024)), 10);
    if (فهرس === 0) resolve(`${بايت} ${أحجام[فهرس]}`);
    resolve(`${(بايت / (1024 ** فهرس)).toFixed(1)} ${أحجام[فهرس]}`);
  });
}

async function تنزيل_صوت_يوتيوب(رابط) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(رابط).then(async (معلومات_الرابط) => {
      let نتيجة = [];
      for (let i = 0; i < معلومات_الرابط.formats.length; i++) {
        let عنصر = معلومات_الرابط.formats[i];
        if (عنصر.mimeType == 'audio/webm; codecs=\"opus\"') {
          let { contentLength } = عنصر;
          let بايت = await تحويل_بايت_إلى_حجم(contentLength);
          نتيجة[i] = { صوت: عنصر.url, حجم: بايت };
        }
      }
      let نتيجة_نهائية = نتيجة.filter(x => x.صوت != undefined && x.حجم != undefined);
      let مختصر = await axios.get(`https://tinyurl.com/api-create.php?url=${نتيجة_نهائية[0].صوت}`);
      let رابط_مختصر = مختصر.data;
      let العنوان = معلومات_الرابط.videoDetails.title;
      let صورة_صغيرة = معلومات_الرابط.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({ العنوان, نتيجة: رابط_مختصر, نتيجة2: نتيجة_نهائية, صورة_صغيرة });
    }).catch(reject);
  });
}

async function تنزيل_فيديو_يوتيوب(رابط) {
  return new Promise(async (resolve, reject) => {
    ytdl.getInfo(رابط).then(async (معلومات_الرابط) => {
      let نتيجة = [];
      for (let i = 0; i < معلومات_الرابط.formats.length; i++) {
        let عنصر = معلومات_الرابط.formats[i];
        if (عنصر.container == 'mp4' && عنصر.hasVideo == true && عنصر.hasAudio == true) {
          let { qualityLabel, contentLength } = عنصر;
          let بايت = await تحويل_بايت_إلى_حجم(contentLength);
          نتيجة[i] = { فيديو: عنصر.url, جودة: qualityLabel, حجم: بايت };
        }
      }
      let نتيجة_نهائية = نتيجة.filter(x => x.فيديو != undefined && x.حجم != undefined && x.جودة != undefined);
      let مختصر = await axios.get(`https://tinyurl.com/api-create.php?url=${نتيجة_نهائية[0].فيديو}`);
      let رابط_مختصر = مختصر.data;
      let العنوان = معلومات_الرابط.videoDetails.title;
      let صورة_صغيرة = معلومات_الرابط.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({ العنوان, نتيجة: رابط_مختصر, نتيجة2: نتيجة_نهائية[0].فيديو, صورة_صغيرة });
    }).catch(reject);
  });
}

async function تشغيل_صوت(استعلام) {
  return new Promise((resolve, reject) => {
    yts(استعلام).then(async (بيانات) => {
      let نتيجة = بيانات.videos.slice(0, 5);
      let روابط = [];
      for (let i = 0; i < نتيجة.length; i++) {
        روابط.push(نتيجة[i].url);
      }
      let عشوائي = روابط[0];
      let صوت = await تنزيل_صوت_يوتيوب(عشوائي);
      resolve(صوت);
    }).catch(reject);
  });
}

async function تشغيل_فيديو(استعلام) {
  return new Promise((resolve, reject) => {
    yts(استعلام).then(async (بيانات) => {
      let نتيجة = بيانات.videos.slice(0, 5);
      let روابط = [];
      for (let i = 0; i < نتيجة.length; i++) {
        روابط.push(نتيجة[i].url);
      }
      let عشوائي = روابط[0];
      let فيديو = await تنزيل_فيديو_يوتيوب(عشوائي);
      resolve(فيديو);
    }).catch(reject);
  });
                }
