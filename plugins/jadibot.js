import { startSubBot } from '../lib/subbot.js';
let commandFlags = {};

const handler = async (m, { conn, command }) => {
  commandFlags[m.sender] = true;

  const نصQR = `*🤖 بوت لولي - LoliBot-MD 🤖*\n\n📲 *لجعل هذا الجهاز بوت فرعي (Sub Bot)*\n\n🟢 *من هاتف آخر أو من الكمبيوتر، امسح هذا الرمز QR لتصبح بوتًا فرعيًا:*\n\n1️⃣ افتح النقاط الثلاث أعلى الواجهة\n2️⃣ اختر "واتساب ويب"\n3️⃣ امسح الكود QR المعروض\n\n⚠️ *ينتهي صلاحية هذا الكود خلال 45 ثانية!*\n\n❗️ لسنا مسؤولين عن أي استخدام غير قانوني.`;

  const نصكود = `*🤖 بوت لولي - LoliBot-MD 🤖*\n\n📲 *لجعل هذا الجهاز بوت فرعي باستخدام كود هاتف:*\n\n1️⃣ افتح النقاط الثلاث أعلى الواجهة\n2️⃣ اختر "الأجهزة المرتبطة"\n3️⃣ اضغط "ربط بجهاز جديد"\n4️⃣ اختر "استخدام كود هاتف"\n\n🔢 *أدخل الكود المكون من 8 أرقام هنا خلال 60 ثانية:*`;

  const الهاتف = m.sender?.split('@')[0];
  const استخدام_كود = /^(بوتكود|كود)$/i.test(command);
  const الرد = استخدام_كود ? نصكود : نصQR;

  await startSubBot(m, conn, الرد, استخدام_كود, الهاتف, m.chat, commandFlags);
};

handler.help = ['بوت', 'بوتكود', 'كود'];
handler.tags = ['jadibot'];
handler.command = /^(بوت|بوتكود|كود|qr)$/i;
handler.register = false;

export default handler;
