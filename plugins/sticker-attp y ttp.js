import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import { db } from '../lib/postgres.js';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const userResult = await db.query('SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1', [m.sender]);
  const user = userResult.rows[0] || {};

  let f = user.sticker_packname || global.info.packname;
  let g = (user.sticker_packname && user.sticker_author ? user.sticker_author : (user.sticker_packname && !user.sticker_author ? '' : global.info.author));

  if (!text) return m.reply(`⚠️ اكتب النص الذي تريد تحويله إلى ملصق.\n📌 مثال:\n*${usedPrefix + command}* مرحبًا!`);

  let teks = encodeURI(text);

  conn.fakeReply(m.chat, `⏳ جاري تحويل النص إلى ملصق، الرجاء الانتظار...\n\n> *قد يستغرق الأمر بضع ثوانٍ*`, '0@s.whatsapp.net', `لا ترسل أوامر متكررة`, 'status@broadcast')

  if (command == 'نص-متحرك') {
    if (text.length > 40) return m.reply(`⚠️ النص لا يمكن أن يتجاوز 40 حرفًا.\n✍️ جرب نصًا أقصر.`);
    let res = await fetch(`https://api.neoxr.eu/api/attp?text=${teks}%21&color=%5B%22%23FF0000%22%2C+%22%2300FF00%22%2C+%22%230000FF%22%5D&apikey=GataDios`);
    let json = await res.json();
    if (!json.status) return m.reply('❌ حدث خطأ في الاتصال بـ API، حاول لاحقًا.');
    let stiker = await sticker(null, json.data.url, f, g);
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
      contextInfo: {
        forwardingScore: 200,
        isForwarded: false,
        externalAdReply: {
          showAdAttribution: false,
          title: info.wm,
          body: info.vs,
          mediaType: 2,
          sourceUrl: info.md,
          thumbnail: m.pp
        }
      }
    }, { quoted: m });
  }

  if (command == 'نص' || command == 'نص-ثابت') {
    if (text.length > 300) return m.reply(`⚠️ النص لا يمكن أن يتجاوز 300 حرف.\n✍️ جرب نصًا أقصر.`);
    let res = await fetch(`https://api.neoxr.eu/api/brat?text=${teks}&apikey=GataDios`);
    let json = await res.json();
    if (!json.status) return m.reply('❌ حدث خطأ في الاتصال بـ API، حاول لاحقًا.');
    let stiker = await sticker(null, json.data.url, f, g);
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
      contextInfo: {
        forwardingScore: 200,
        isForwarded: false,
        externalAdReply: {
          showAdAttribution: false,
          title: info.wm,
          body: info.vs,
          mediaType: 2,
          sourceUrl: info.md,
          thumbnail: m.pp
        }
      }
    }, { quoted: m });
  }

  if (command == 'نص-فيديو') {
    if (text.length > 250) return m.reply(`⚠️ النص لا يمكن أن يتجاوز 250 حرف.\n✍️ جرب نصًا أقصر.`);
    let res = await fetch(`https://api.neoxr.eu/api/bratvid?text=${teks}&apikey=GataDios`);
    let json = await res.json();
    if (!json.status) return m.reply('❌ حدث خطأ في الاتصال بـ API، حاول لاحقًا.');
    let stiker = await sticker(null, json.data.url, f, g);
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
      contextInfo: {
        forwardingScore: 200,
        isForwarded: false,
        externalAdReply: {
          showAdAttribution: false,
          title: info.wm,
          body: info.vs,
          mediaType: 2,
          sourceUrl: info.md,
          thumbnail: m.pp
        }
      }
    }, { quoted: m });
  }
};

handler.help = ['نص-متحرك', 'نص', 'نص-فيديو'];
handler.tags = ['sticker'];
handler.command = /^(نص|نص-ثابت|نص-متحرك|نص-فيديو)$/i;
handler.register = true;

export default handler;
