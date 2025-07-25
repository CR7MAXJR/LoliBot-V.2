// استيراد المكتبات المطلوبة
//import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { تنزيل_يوتيوب } from '../lib/yt-savetube.js'
import { تنزيل_صوت_يوتيوب } from '../lib/youtubedl.js';

const الحد_الصوتي = 725 * 1024 * 1024; // 725 ميغابايت
const الحد_الفيديو = 425 * 1024 * 1024; // 425 ميغابايت
const تعبير_معرف_يوتيوب = /(?:youtu.be/|youtube.com/(?:watch?v=|embed/))([a-zA-Z0-9_-]{11})/;
const تعليقات_المستخدم = new Map();
const طلبات_المستخدم = {};

const معالج = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔 ماذا تبحث عنه؟ 🤔*\n*أدخل اسم الأغنية*\n\n*مثال:*\n${usedPrefix + command} إميليا 420`);
  
  const نوع_التنزيل = command === 'تشغيل' || command === 'موسيقى' ? 'صوت' : 
                      command === 'تشغيل2' ? 'فيديو' : 
                      command === 'تشغيل3' ? 'صوت (مستند)' : 
                      command === 'تشغيل4' ? 'فيديو (مستند)' : '';
  
  if (طلبات_المستخدم[m.sender]) return await conn.reply(m.chat, `⏳ مهلًا @${m.sender.split('@')[0]}، انتظر قليلًا، أنت تقوم بالتنزيل بالفعل 🙄\nانتظر حتى ينتهي طلبك الحالي قبل تقديم طلب آخر...`, تعليقات_المستخدم.get(m.sender) || m);
  
  طلبات_المستخدم[m.sender] = true;
  
  try {
    let معرف_الفيديو_المطلوب = text.match(تعبير_معرف_يوتيوب) || null;
    const نتائج_تشغيل = await بحث(args.join(' '));
    let نتائج_يوتيوب = await yts(معرف_الفيديو_المطلوب === null ? text : 'https://youtu.be/' + معرف_الفيديو_المطلوب[1]);
    
    if (معرف_الفيديو_المطلوب) {
      const معرف_الفيديو = معرف_الفيديو_المطلوب[1];
      نتائج_يوتيوب = نتائج_يوتيوب.all.find(item => item.videoId === معرف_الفيديو) || نتائج_يوتيوب.videos.find(item => item.videoId === معرف_الفيديو);
    }
    
    نتائج_يوتيوب = نتائج_يوتيوب.all?.[0] || نتائج_يوتيوب.videos?.[0] || نتائج_يوتيوب;
    
    const نص_التشغيل = await conn.sendMessage(m.chat, { 
      text: `${نتائج_تشغيل[0].title}
⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻

⏰ المدة: ${تحويل_الثواني(نتائج_تشغيل[0].duration.seconds)}
👉🏻 انتظر لحظة بينما أرسل ${نوع_التنزيل}`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363305025805187@newsletter',
          serverMessageId: '',
          newsletterName: 'لولي_بوت ✨️'
        },
        forwardingScore: 9999999,
        isForwarded: true,
        mentionedJid: null,
        externalAdReply: {
          showAdAttribution: false,
          renderLargerThumbnail: false,
          title: نتائج_تشغيل[0].title,
          body: "لولي_بوت",
          containsAutoReply: true,
          mediaType: 1,
          thumbnailUrl: نتائج_تشغيل[0].thumbnail,
          sourceUrl: "skyultraplus.com"
        }
      }
    }, { quoted: m });
    
    تعليقات_المستخدم.set(m.sender, نص_التشغيل);

    const [إدخال, جودة_الإدخال = command === 'تشغيل' || command === 'موسيقى' || command === 'تشغيل3' ? '320' : '720'] = text.split(' ');
    const جودات_الصوت = ['64', '96', '128', '192', '256', '320'];
    const جودات_الفيديو = ['240', '360', '480', '720', '1080'];
    const أمر_صوتي = command === 'تشغيل' || command === 'موسيقى' || command === 'تشغيل3';
    const جودة_محددة = (أمر_صوتي ? جودات_الصوت : جودات_الفيديو).includes(جودة_الإدخال) ? جودة_الإدخال : (أمر_صوتي ? '320' : '720');
    const هل_صوت = command.toLowerCase().includes('mp3') || command.toLowerCase().includes('audio');
    const تنسيق = هل_صوت ? 'mp3' : '720';

    const واجهات_الصوت = [
      { رابط: () => تنزيل_يوتيوب(نتائج_تشغيل[0].url, تنسيق), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) },
      { رابط: () => تنزيل_صوت_يوتيوب(نتائج_تشغيل[0].url, جودة_محددة, 'audio'), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) },
      { رابط: () => fetch(`https://api.dorratz.com/v3/ytdl?url=${نتائج_تشغيل[0].url}`).then(res => res.json()), استخراج: (بيانات) => {
        const mp3 = بيانات.medias.find(media => media.quality === "160kbps" && media.extension === "mp3");
        return { بيانات: mp3.url, مباشر: false };
      }},
      { رابط: () => fetch(`https://api.neoxr.eu/api/youtube?url=${نتائج_تشغيل[0].url}&type=audio&quality=128kbps&apikey=GataDios`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.data.url, مباشر: false }) },
      { رابط: () => fetch(`https://api.fgmods.xyz/api/downloader/ytmp4?url=${نتائج_تشغيل[0].url}&apikey=elrebelde21`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.result.dl_url, مباشر: false }) },
      { رابط: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${نتائج_تشغيل[0].url}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.dl, مباشر: false }) },
      { رابط: () => fetch(`${info.apis}/download/ytmp3?url=${نتائج_تشغيل[0].url}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.status ? بيانات.data.download.url : null, مباشر: false }) },
      { رابط: () => fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${نتائج_تشغيل[0].url}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.result.download.url, مباشر: false }) },
      { رابط: () => fetch(`https://exonity.tech/api/dl/playmp3?query=${نتائج_تشغيل[0].title}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) }
    ];

    const واجهات_الفيديو = [
      { رابط: () => تنزيل_يوتيوب(نتائج_تشغيل[0].url, '720'), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) },
      { رابط: () => تنزيل_صوت_يوتيوب(نتائج_تشغيل[0].url, جودة_محددة, 'video'), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) },
      { رابط: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${نتائج_تشغيل[0].url}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.dl, مباشر: false }) },
      { رابط: () => fetch(`https://api.neoxr.eu/api/youtube?url=${نتائج_تشغيل[0].url}&type=video&quality=720p&apikey=GataDios`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.data.url, مباشر: false }) },
      { رابط: () => fetch(`https://api.fgmods.xyz/api/downloader/ytmp4?url=${نتائج_تشغيل[0].url}&apikey=elrebelde21`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.result.dl_url, مباشر: false }) },
      { رابط: () => fetch(`${info.apis}/download/ytmp4?url=${encodeURIComponent(نتائج_تشغيل[0].url)}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.status ? بيانات.data.download.url : null, مباشر: false }) },
      { رابط: () => fetch(`https://exonity.tech/api/dl/playmp4?query=${encodeURIComponent(نتائج_تشغيل[0].title)}`).then(res => res.json()), استخراج: (بيانات) => ({ بيانات: بيانات.result.download, مباشر: false }) }
    ];

    const تنزيل = async (واجهات) => {
      let بيانات_الوسائط = null;
      let مباشر = false;
      for (const واجهة of واجهات) {
        try {
          const بيانات = await واجهة.رابط();
          const { بيانات: بيانات_مستخرجة, مباشر: مباشرة } = واجهة.استخراج(بيانات);
          if (بيانات_مستخرجة) {
            const حجم = await حجم_الملف(بيانات_مستخرجة);
            if (حجم >= 1024) {
              بيانات_الوسائط = بيانات_مستخرجة;
              مباشر = مباشرة;
              break;
            }
          }
        } catch (e) {
          console.log(`خطأ مع واجهة البرمجة: ${e}`);
          continue;
        }
      }
      return { بيانات_الوسائط, مباشر };
    };

    if (command === 'تشغيل' || command === 'موسيقى') {
      const { بيانات_الوسائط, مباشر } = await تنزيل(واجهات_الصوت);
      if (بيانات_الوسائط) {
        const حجم_الملف = await حجم_الملف(بيانات_الوسائط);
        if (حجم_الملف > الحد_الصوتي) {
          await conn.sendMessage(m.chat, { document: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, mimetype: 'audio/mpeg', fileName: `${نتائج_تشغيل[0].title}.mp3`, contextInfo: {} }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { audio: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
        }
      } else {
        //await m.react('❌');
      }
    }

    if (command === 'تشغيل2' || command === 'فيديو') {
      const { بيانات_الوسائط, مباشر } = await تنزيل(واجهات_الفيديو);
      if (بيانات_الوسائط) {
        const حجم_الملف = await حجم_الملف(بيانات_الوسائط);
        const خيارات_الرسالة = { fileName: `${نتائج_تشغيل[0].title}.mp4`, caption: `🔰 إليك الفيديو الخاص بك \n🔥 العنوان: ${نتائج_تشغيل[0].title}`, mimetype: 'video/mp4' };
        if (حجم_الملف > الحد_الفيديو) {
          await conn.sendMessage(m.chat, { document: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, ...خيارات_الرسالة }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { video: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, thumbnail: نتائج_تشغيل[0].thumbnail, ...خيارات_الرسالة }, { quoted: m });
        }
      } else {
        //await m.react('❌');
      }
    }

    if (command === 'تشغيل3' || command === 'مستند_صوت') {
      const { بيانات_الوسائط, مباشر } = await تنزيل(واجهات_الصوت);
      if (بيانات_الوسائط) {
        await conn.sendMessage(m.chat, { document: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, mimetype: 'audio/mpeg', fileName: `${نتائج_تشغيل[0].title}.mp3`, contextInfo: {} }, { quoted: m });
      } else {
        await m.react('❌');
      }
    }

    if (command === 'تشغيل4' || command === 'مستند_فيديو') {
      const { بيانات_الوسائط, مباشر } = await تنزيل(واجهات_الفيديو);
      if (بيانات_الوسائط) {
        await conn.sendMessage(m.chat, { document: مباشر ? بيانات_الوسائط : { url: بيانات_الوسائط }, fileName: `${نتائج_تشغيل[0].title}.mp4`, caption: `🔰 العنوان: ${نتائج_تشغيل[0].title}`, thumbnail: نتائج_تشغيل[0].thumbnail, mimetype: 'video/mp4'}, { quoted: m });
      } else {
        //await m.react('❌');
      }
    }
  } catch (خطأ) {
    console.error(خطأ);
    m.react("❌️");
  } finally {
    delete طلبات_المستخدم[m.sender];
  }
};

معالج.help = ['تشغيل', 'تشغيل2', 'تشغيل3', 'تشغيل4', 'مستند_صوت'];
معالج.tags = ['تنزيل'];
معالج.command = ['تشغيل', 'تشغيل2', 'تشغيل3', 'تشغيل4', 'صوت', 'فيديو', 'مستند_صوت', 'مستند_فيديو', 'موسيقى'];
معالج.register = true;
export default معالج;

async function بحث(استعلام, خيارات = {}) {
  const نتائج_البحث = await yts.search({ query: استعلام, hl: 'es', gl: 'ES', ...خيارات });
  return نتائج_البحث.videos;
}

function تنسيق_الأرقام(رقم) {
  const تعبير = /(\d)(?=(\d{3})+(?!\d))/g;
  const بديل = '$1.';
  const مصفوفة = رقم.toString().split('.');
  مصفوفة[0] = مصفوفة[0].replace(تعبير, بديل);
  return مصفوفة[1] ? مصفوفة.join('.') : مصفوفة[0];
}

function تحويل_الثواني(ثواني) {
  ثواني = Number(ثواني);
  const أيام = Math.floor(ثواني / (3600 * 24));
  const ساعات = Math.floor((ثواني % (3600 * 24)) / 3600);
  const دقائق = Math.floor((ثواني % 3600) / 60);
  const ثوان = Math.floor(ثواني % 60);
  const عرض_الأيام = أيام > 0 ? أيام + (أيام == 1 ? ' يوم، ' : ' أيام، ') : '';
  const عرض_الساعات = ساعات > 0 ? ساعات + (ساعات == 1 ? ' ساعة، ' : ' ساعات، ') : '';
  const عرض_الدقائق = دقائق > 0 ? دقائق + (دقائق == 1 ? ' دقيقة، ' : ' دقائق، ') : '';
  const عرض_الثواني = ثوان > 0 ? ثوان + (ثوان == 1 ? ' ثانية' : ' ثوانٍ') : '';
  return عرض_الأيام + عرض_الساعات + عرض_الدقائق + عرض_الثواني;
}

const جلب_المخزن_المؤقت = async (رابط) => {
  try {
    const استجابة = await fetch(رابط);
    const مخزن_مؤقت = await استجابة.arrayBuffer();
    return Buffer.from(مخزن_مؤقت);
  } catch (خطأ) {
    console.error("خطأ في جلب المخزن المؤقت", خطأ);
    throw new Error("خطأ في جلب المخزن المؤقت");
  }
};

async function حجم_الملف(رابط) {
  try {
    const استجابة = await fetch(رابط, { method: 'HEAD' });
    return parseInt(استجابة.headers.get('content-length') || 0);
  } catch {
    return 0; // إذا فشل، نفترض 0
  }
}
