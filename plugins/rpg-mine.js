const handler = async (m, { conn }) => {
  const now = Date.now();
  const cooldown = 600_000; // 10 دقائق
  const hasil = Math.floor(Math.random() * 6000);

  const res = await m.db.query("SELECT exp, lastmiming FROM usuarios WHERE id = $1", [m.sender]);
  const user = res.rows[0];
  const lastMine = Number(user?.lastmiming) || 0;
  const nextMineTime = lastMine + cooldown;
  const restante = Math.max(0, nextMineTime - now);

  if (restante > 0) {
    return m.reply(`⏳ انتظر *${msToTime(restante)}* قبل أن تنقب مجددًا`);
  }

  const minar = pickRandom([
    '⛏️ رائع! لقد نقبت ووجدت',
    '✨ ممتاز! حصلت على',
    '😎 منقب محترف! ربحت',
    '⛏️ تمت عملية التنقيب بنجاح! حصلت على',
    '😲 حظ موفق! وجدت',
    '📈 أرباحك زادت لأنك نقبت ووجدت',
    '🪨 تم التنقيب... والنتيجة',
    '🤩 واو! حصلت الآن على',
    '🔮 الحظ كان حليفك، ربحت',
    '😻 تنقيب موفق! حصلت على',
    '🎯 المهمة اكتملت! النقود المكتسبة:',
    '💰 التنقيب جلب لك',
    '🌍 وجدت مكانًا مميزًا ونقبت فيه لتحصل على',
    '🎉 بفضل التنقيب، رصيدك ارتفع بـ',
    '🥳 مبروك! حصلت على',
    '⛏️⛏️⛏️ وجدت'
  ]);

  await m.db.query(`
    UPDATE usuarios 
    SET exp = exp + $1, lastmiming = $2 
    WHERE id = $3
  `, [hasil, now, m.sender]);

  m.reply(`${minar} *${formatNumber(hasil)} خبرة*`);
};

handler.help = ['تنقيب'];
handler.tags = ['اقتصاد'];
handler.command = ['تنقيب']; // يمكنك إضافة ['minar', 'mine'] أيضاً إذا أردت دعماً متعددًا
handler.register = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
  const totalSeconds = Math.floor(Math.max(0, duration) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} دقيقة و ${seconds} ثانية`;
}

function formatNumber(num) {
  return num.toLocaleString('ar-EG'); // تنسيق عربي للأرقام
}
