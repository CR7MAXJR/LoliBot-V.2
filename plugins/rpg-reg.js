import { createHash } from 'crypto';
import moment from 'moment-timezone'
import { db } from '../lib/postgres.js';

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const formatPhoneNumber = (jid) => {
  if (!jid) return null;
  const number = jid.replace('@s.whatsapp.net', '');
  if (!/^\d{8,15}$/.test(number)) return null;
  return `+${number}`;
};

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
let fkontak = {key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, message: {contactMessage: {vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, participant: "0@s.whatsapp.net"};
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;

const date = moment.tz('Africa/Cairo').format('DD/MM/YYYY')
const time = moment.tz('Africa/Cairo').format('LT')
let userNationality = null;

try {
  const phone = formatPhoneNumber(who);
  if (phone) {
    const response = await fetch(`${info.apis}/tools/country?text=${phone}`);
    const data = await response.json();
    userNationality = data.result ? `${data.result.name} ${data.result.emoji}` : null;
  }
} catch (err) {
  userNationality = null;
}

const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
let user = userResult.rows[0] || { registered: false };
let name2 = m.pushName || 'أنت';
const totalRegResult = await db.query(`SELECT COUNT(*) AS total FROM usuarios WHERE registered = true`);
const rtotalreg = parseInt(totalRegResult.rows[0].total);

if (['تسجيل', 'reg', 'verify', 'verificar'].includes(command)) {
  if (user.registered) return m.reply(`*✅ أنت مسجل بالفعل*`);
  if (!Reg.test(text)) return m.reply(`*⚠️ هل لا تعرف كيف تستخدم الأمر؟*\n\n*الاستخدام الصحيح:* ${usedPrefix + command} الاسم.العمر\n*مثال:* ${usedPrefix + command} ${name2}.18`);

  let [_, name, splitter, age] = text.match(Reg);
  if (!name) return m.reply('*⚠️ الرجاء إدخال اسمك*');
  if (!age) return m.reply('*⚠️ الرجاء إدخال عمرك*');
  if (name.length >= 45) return m.reply('*⚠️ الاسم طويل جدًا*');
  age = parseInt(age);
  if (age > 100) return m.reply('👴🏻 العمر كبير جدًا!');
  if (age < 5) return m.reply('🚼 هل الأطفال يعرفون الكتابة؟');

  const sn = createHash('md5').update(m.sender).digest('hex');
  await db.query(`INSERT INTO usuarios (id, nombre, edad, money, limite, exp, reg_time, registered, serial_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
          ON CONFLICT (id) DO UPDATE
          SET nombre = $2,
              edad = $3,
              money = usuarios.money + $4,
              limite = usuarios.limite + $5,
              exp = usuarios.exp + $6,
              reg_time = $7,
              registered = true,
              serial_number = $8`, [m.sender, name.trim() + '✓', age, 400, 2, 150, new Date(), sn]);

  await conn.sendMessage(m.chat, {
    text: `✅ *تم تسجيلك بنجاح*\n\n👤 *الاسم:* ${name}\n🎂 *العمر:* ${age} سنة\n🕒 *الوقت:* ${time}\n📅 *التاريخ:* ${date}${userNationality ? `\n🌍 *الدولة:* ${userNationality}` : ''}\n📱 *الرقم:* wa.me/${who.split`@`[0]}\n🔑 *الرقم التسلسلي:*\n⤷ ${sn}\n\n🎁 *مكافأتك:*\n💎 2 ألماس\n🪙 400 عملة\n⭐ 150 نقطة خبرة\n\n📜 *لعرض قائمة الأوامر:* ${usedPrefix}القائمة\n👥 *إجمالي المسجلين:* ${toNum(rtotalreg + 1)}`,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        containsAutoReply: true,
        title: `تسجيل جديد`,
        body: 'LoliBot',
        previewType: 'PHOTO',
        thumbnailUrl: "https://telegra.ph/file/33bed21a0eaa789852c30.jpg",
        sourceUrl: "https://www.youtube.com/@elrebelde.21"
      }
    }
  }, { quoted: fkontak });
}

if (['سيري', 'nserie', 'myns', 'sn'].includes(command)) {
  const sn = user.serial_number || createHash('md5').update(m.sender).digest('hex');
  await m.reply(`🔑 رقمك التسلسلي:\n${sn}`);
}

if (['الغاء', 'unreg'].includes(command)) {
  if (!args[0]) return m.reply(`✳️ *أدخل رقمك التسلسلي*\nلمعرفة رقمك التسلسلي، استخدم:\n\n*${usedPrefix}سيري*`);
  const user = userResult.rows[0] || {};
  const sn = user.serial_number || createHash('md5').update(m.sender).digest('hex');
  if (args[0] !== sn) return m.reply('⚠️ *رقم تسلسلي غير صحيح*');
  await db.query(`UPDATE usuarios
          SET registered = false,
              nombre = NULL,
              edad = NULL,
              money = money - 400,
              limite = limite - 2,
              exp = exp - 150,
              reg_time = NULL,
              serial_number = NULL
          WHERE id = $1`, [m.sender]);
  await m.reply(`😢 تم إلغاء تسجيلك بنجاح.`);
}
};

handler.help = ['تسجيل <اسم.عمر>', 'سيري', 'الغاء <رقم_تسلسلي>'];
handler.tags = ['عام'];
handler.command = /^(تسجيل|سيري|الغاء|reg|verify|verificar|nserie|myns|sn|unreg)$/i;

export default handler;

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number <= -1000 && number > -1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number <= -1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else {
    return number.toString();
  }
}
