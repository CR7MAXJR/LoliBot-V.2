import fetch from "node-fetch"
import { db } from '../lib/postgres.js';
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const userResult = await db.query('SELECT sticker_packname, sticker_author FROM usuarios WHERE id = $1', [m.sender]);
  const user = userResult.rows[0] || {};
  let f = user.sticker_packname || global.info.packname;
  let g = (user.sticker_packname && user.sticker_author ? user.sticker_author : (user.sticker_packname && !user.sticker_author ? '' : global.info.author));

  if (!args[0]) throw `⚠️ *يرجى إدخال رابط حزمة الملصقات من تيليغرام.*\n📌 *مثال:*\n${usedPrefix + command} https://t.me/addstickers/Porcientoreal`;

  if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) throw `⚠️ *الرابط الذي أدخلته غير صحيح!*\n✅ يجب أن يكون بالشكل:\nhttps://t.me/addstickers/اسم_الحزمة`;

  let packName = args[0].replace("https://t.me/addstickers/", "");
  let gas = await fetch(`https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=${encodeURIComponent(packName)}`, { method: "GET", headers: { "User-Agent": "GoogleBot" } });

  if (!gas.ok) throw '❌ حدث خطأ أثناء جلب بيانات الحزمة من تيليغرام';

  let json = await gas.json();

  m.reply(`✅ *عدد الملصقات:* ${json.result.stickers.length}\n⏳ *المدة المقدّرة للإرسال:* ${json.result.stickers.length * 1.5} ثانية`);

  for (let i = 0; i < json.result.stickers.length; i++) {
    let fileId = json.result.stickers[i].thumb.file_id;
    let gasIn = await fetch(`https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${fileId}`);
    let jisin = await gasIn.json();

    let stiker = await sticker(false, "https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/" + jisin.result.file_path, f, g);

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
      contextInfo: {
        'forwardingScore': 200,
        'isForwarded': false,
        externalAdReply: {
          showAdAttribution: false,
          title: info.wm,
          body: `🎉 حزمة ملصقات تيليغرام`,
          mediaType: 2,
          sourceUrl: info.nna,
          thumbnail: m.pp
        }
      }
    }, { quoted: m });

    await delay(3000);
  }

  throw `❌ *تم تنفيذ العملية، لكن يبدو أن هناك خطأ في بعض الملصقات.*\n📩 *يرجى مراسلة المطور لإصلاح ذلك*`;
}

handler.help = ['ملصقات-تيلي *<الرابط>*']
handler.tags = ['sticker', 'downloader']
handler.command = /^(ملصقات-تيلي)$/i
handler.limit = 1
handler.register = true
export default handler

const delay = time => new Promise(res => setTimeout(res, time))
