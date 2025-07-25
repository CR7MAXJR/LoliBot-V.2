import axios from 'axios';
import fetch from 'node-fetch';
import fg from 'api-dylux';

let free = 150;
let prem = 500;
const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const sticker = 'https://qu.ax/Wdsb.webp';
  
  if (!args[0]) return m.reply(
    `⚠️ يرجى إدخال رابط ميديافاير صالح.\n📥 مثال:\n${usedPrefix + command} https://www.mediafire.com/file/sd9hl31vhhzf76v/EvolutionV1.1-beta_%2528Recomendado%2529.apk/file`
  );

  if (userRequests[m.sender]) {
    return await conn.reply(
      m.chat,
      `⚠️ مرحبًا @${m.sender.split('@')[0]}، لديك عملية تحميل جارية بالفعل.\n⏳ الرجاء الانتظار حتى تكتمل قبل إرسال طلب جديد.`,
      userCaptions.get(m.sender) || m
    );
  }

  userRequests[m.sender] = true;
  m.react(`🚀`);

  try {
    const downloadAttempts = [
      // Neoxr
      async () => {
        const res = await fetch(`https://api.neoxr.eu/api/mediafire?url=${args[0]}&apikey=GataDios`);
        const data = await res.json();
        if (!data.status) throw new Error('فشل Neoxr');
        return {
          url: data.result.url,
          filename: data.result.filename,
          filesize: data.result.size,
          mimetype: data.result.mimetype
        };
      },

      // Agatz
      async () => {
        const res = await fetch(`https://api.agatz.xyz/api/mediafire?url=${args[0]}`);
        const data = await res.json();
        return {
          url: data.data[0].link,
          filename: data.data[0].nama,
          filesize: data.data[0].size,
          mimetype: data.data[0].mime
        };
      },

      // Siputzx
      async () => {
        const res = await fetch(`https://api.siputzx.my.id/api/d/mediafire?url=${args[0]}`);
        const data = await res.json();
        return data.data.map(file => ({
          url: file.link,
          filename: file.filename,
          filesize: file.size,
          mimetype: file.mime
        }))[0];
      },

      // info.apis
      async () => {
        const res = await fetch(`${info.apis}/api/mediafire?url=${args[0]}`);
        const data = await res.json();
        return data.data.map(file => ({
          url: file.link,
          filename: file.filename,
          filesize: file.size,
          mimetype: file.mime
        }))[0];
      }
    ];

    let fileData = null;

    for (const attempt of downloadAttempts) {
      try {
        fileData = await attempt();
        if (fileData) break;
      } catch (err) {
        console.error(`خطأ في المحاولة: ${err.message}`);
        continue;
      }
    }

    if (!fileData) throw new Error('لم يتم العثور على ملف صالح من خلال أي واجهة API');

    const file = Array.isArray(fileData) ? fileData[0] : fileData;

    const caption = `┏━━『 ميديافاير 』━━•
┃📄 الاسم : ${file.filename}
┃📦 الحجم : ${file.filesize}
┃📁 النوع : ${file.mimetype}
╰━━━⊰ جاري الإرسال ⊱━━━•

⌛ الرجاء الانتظار حتى يتم إرسال الملف...`;

    const captionMessage = await conn.reply(m.chat, caption, m);
    userCaptions.set(m.sender, captionMessage);

    await conn.sendFile(m.chat, file.url, file.filename, '', m, null, {
      mimetype: file.mimetype,
      asDocument: true
    });

    m.react('✅');

  } catch (e) {
    await conn.sendFile(m.chat, sticker, 'error.webp', '', m);
    m.react('❌');
    console.error(e);
    handler.limit = false;
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['ميديافاير', 'تحميل_ميديافاير'];
handler.tags = ['downloader'];
handler.command = /^(ميديافاير|تحميل_ميديافاير|mediafire|mediafiredl|dlmediafire)$/i;
handler.register = true;
handler.limit = 3;

export default handler;
