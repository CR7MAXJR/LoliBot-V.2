import axios from 'axios';
//import cheerio from 'cheerio';
//import { search, download } from 'aptoide-scraper';
const userMessages = new Map();
const userRequests = {};

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const apkpureApi = 'https://apkpure.com/api/v2/search?q=';
  const apkpureDownloadApi = 'https://apkpure.com/api/v2/download?id=';

  if (!text) return m.reply(`⚠️ *اكتب اسم التطبيق الذي تريد تحميله*`);

  if (userRequests[m.sender]) {
    return await conn.reply(m.chat,
      `⚠️ مرحبًا @${m.sender.split('@')[0]}، أنت بالفعل تقوم بتحميل تطبيق حاليًا 🙄\nيرجى الانتظار حتى تنتهي عملية التحميل الحالية. 👆`,
      userMessages.get(m.sender) || m
    );
  }

  userRequests[m.sender] = true;
  m.react("⌛");

  try {
    const downloadAttempts = [
      async () => {
        const res = await fetch(`https://api.dorratz.com/v2/apk-dl?text=${text}`);
        const data = await res.json();
        if (!data.name) throw new Error('لم يتم العثور على بيانات من واجهة dorratz');
        return {
          name: data.name,
          package: data.package,
          lastUpdate: data.lastUpdate,
          size: data.size,
          icon: data.icon,
          dllink: data.dllink
        };
      },
      async () => {
        const res = await fetch(`${info.apis}/download/apk?query=${text}`);
        const data = await res.json();
        const apkData = data.data;
        return {
          name: apkData.name,
          developer: apkData.developer,
          publish: apkData.publish,
          size: apkData.size,
          icon: apkData.image,
          dllink: apkData.download
        };
      },
      async () => {
        const searchA = await search(text);
        const data5 = await download(searchA[0].id);
        return {
          name: data5.name,
          package: data5.package,
          lastUpdate: data5.lastup,
          size: data5.size,
          icon: data5.icon,
          dllink: data5.dllink
        };
      }
    ];

    let apkData = null;
    for (const attempt of downloadAttempts) {
      try {
        apkData = await attempt();
        if (apkData) break;
      } catch (err) {
        console.error(`خطأ في المحاولة: ${err.message}`);
        continue;
      }
    }

    if (!apkData) throw new Error('لم أتمكن من تحميل التطبيق من أي مصدر');

    const response = `≪📦 تم العثور على تطبيق 🚀≫

┏━━━━━━━━━━━━━━━━━━━━━━• 
┃📱 *الاسم:* ${apkData.name}
${apkData.developer ? `┃👨‍💻 *المطور:* ${apkData.developer}` : `┃📦 *الباكيج:* ${apkData.package}`}
┃📅 *آخر تحديث:* ${apkData.developer ? apkData.publish : apkData.lastUpdate}
┃📦 *الحجم:* ${apkData.size}
┗━━━━━━━━━━━━━━━━━━━━━━━•

⏳ *يرجى الانتظار، يتم الآن إرسال ملف APK...*`;

    const responseMessage = await conn.sendFile(m.chat, apkData.icon, 'apk.jpg', response, m);
    userMessages.set(m.sender, responseMessage);

    const apkSize = apkData.size.toLowerCase();
    if (apkSize.includes('gb') || (apkSize.includes('mb') && parseFloat(apkSize) > 999)) {
      await m.reply('*⚠️ التطبيق كبير الحجم ولن يتم تحميله تلقائيًا.*');
      return;
    }

    await conn.sendMessage(m.chat, {
      document: { url: apkData.dllink },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${apkData.name}.apk`,
      caption: null
    }, { quoted: m });

    m.react("✅");

  } catch (e) {
    m.react('❌');
    console.log(e);
    handler.limit = false;
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['تطبيق'];
handler.tags = ['التحميل'];
handler.command = /^(تطبيق|تنزيلتطبيق|تحميلتطبيق|apkmod|apk|modapk|aptoide|aptoidedl)$/i;
handler.register = true;
handler.limit = 2;

export default handler;

async function searchApk(text) {
  const response = await axios.get(`${apkpureApi}${encodeURIComponent(text)}`);
  const data = response.data;
  return data.results;
}

async function downloadApk(id) {
  const response = await axios.get(`${apkpureDownloadApi}${id}`);
  const data = response.data;
  return data;
}
