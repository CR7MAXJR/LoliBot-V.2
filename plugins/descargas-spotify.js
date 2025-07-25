import axios from 'axios';
import fetch from 'node-fetch';
import search from 'yt-search';

const userMessages = new Map();
const userRequests = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🤔 ماذا تريد أن تبحث؟*\nاكتب اسم الأغنية لتحميلها من سبوتيفاي.\n\n*مثال:* ${usedPrefix + command} عمرو دياب`);
  
  if (userRequests[m.sender]) return await conn.reply(m.chat,
    `⚠️ مرحبًا @${m.sender.split('@')[0]}، أنت بالفعل تقوم بتحميل أغنية الآن 🙄\nيرجى الانتظار حتى تنتهي العملية الحالية قبل إرسال طلب جديد.`,
    userMessages.get(m.sender) || m
  );

  userRequests[m.sender] = true;
  m.react(`⌛`);
  
  try {
    const spotify = await fetch(`${info.apis}/search/spotify?q=${text}`);
    const song = await spotify.json();
    if (!song.data || song.data.length === 0) return m.reply('⚠️ لم يتم العثور على أي نتائج لهذا البحث.');

    const track = song.data[0];
    const spotifyMessage = `🎧 *معلومات الأغنية:*\n\n*• العنوان:* ${track.title}\n*• الفنان:* ${track.artist}\n*• الألبوم:* ${track.album}\n*• المدة:* ${track.duration}\n*• تاريخ النشر:* ${track.publish}\n\n⌛ *جاري إرسال الأغنية، انتظر قليلاً...*`;

    const message = await conn.sendMessage(m.chat, {
      text: spotifyMessage,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          containsAutoReply: true,
          renderLargerThumbnail: true,
          title: track.title,
          body: "⌛ جاري تحميل الأغنية من سبوتيفاي...",
          mediaType: 1,
          thumbnailUrl: track.image,
          mediaUrl: track.url,
          sourceUrl: track.url
        }
      }
    }, { quoted: m });

    userMessages.set(m.sender, message);

    const downloadAttempts = [
      async () => {
        const res = await fetch(`https://api.siputzx.my.id/api/d/spotify?url=${track.url}`);
        const data = await res.json();
        return data.data.download;
      },
      async () => {
        const res = await fetch(`${info.apis}/download/spotifydl?url=${track.url}`);
        const data = await res.json();
        return data.data.url;
      }
    ];

    let downloadUrl = null;
    for (const attempt of downloadAttempts) {
      try {
        downloadUrl = await attempt();
        if (downloadUrl) break;
      } catch (err) {
        console.error(`خطأ أثناء محاولة التحميل: ${err.message}`);
        continue;
      }
    }

    if (!downloadUrl) throw new Error('لم يتم التمكن من تحميل الأغنية من أي API متاحة.');

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      fileName: `${track.title}.mp3`,
      mimetype: 'audio/mpeg',
      contextInfo: {}
    }, { quoted: m });

    m.react('✅');
  } catch (error) {
    m.reply(`⚠️ *حدث خطأ أثناء تحميل الأغنية!*\n\n*يرجى نسخ الرسالة التالية وإرسالها للمطور باستخدام الأمر:* #ابلاغ\n\n\`\`\`${error}\`\`\``);
    console.log(error);
    m.react('❌');
    handler.limit = false;
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['سبوتيفاي'];
handler.tags = ['downloader'];
handler.command = /^(تشغيل|تحميل_سبوتيفاي|سبوتيفاي|اغنية|موسيقى)$/i;
handler.register = true;
handler.limit = 1;

export default handler;
