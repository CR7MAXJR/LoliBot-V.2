const المجاني = 5000;
const زيادة_الخبرة = 1000;
const مكافأة_الخبرة = 10000;
const مكافأة_الماس = 10;
const مكافأة_المال = 5000;

const handler = async (m, { conn }) => {
  const الآن = Date.now();
  const res = await m.db.query("SELECT exp, limite, money, lastclaim, dailystreak FROM usuarios WHERE id = $1", [m.sender]);
  const المستخدم = res.rows[0];
  const آخر_مطالبة = Number(المستخدم.lastclaim) || 0;
  const السلسلة = Number(المستخدم.dailystreak) || 0;
  const الوقت_التالي = آخر_مطالبة + 86400000;
  const المتبقي = Math.max(0, الوقت_التالي - الآن);

  if (الآن - آخر_مطالبة < 86400000)
    return m.reply(`⚠️ لقد قُمتَ بالفعل بالمطالبة بمكافأتك اليومية، عد بعد *${msToTime(المتبقي)}* 🎁.`);

  const سلسلة_جديدة = (الآن - آخر_مطالبة < 172800000) ? السلسلة + 1 : 1;
  const الخبرة_الحالية = المجاني + (سلسلة_جديدة - 1) * زيادة_الخبرة;
  const الخبرة_التالية = الخبرة_الحالية + زيادة_الخبرة;

  let نص_المكافأة = "";
  if (سلسلة_جديدة % 7 === 0) {
    await m.db.query(`
      UPDATE usuarios 
      SET exp = exp + $1, limite = limite + $2, money = money + $3, lastclaim = $4, dailystreak = $5
      WHERE id = $6
    `, [الخبرة_الحالية + مكافأة_الخبرة, مكافأة_الماس, مكافأة_المال, الآن, سلسلة_جديدة, m.sender]);

    نص_المكافأة = `\n\n🎉 *مكافأة 7 أيام متتالية!* 🎉\n> +${formatNumber(مكافأة_الخبرة)} نقطة خبرة\n> +${مكافأة_الماس} 💎 ألماس\n> +${formatNumber(مكافأة_المال)} 🪙 عملات لولي\n\n`;
  } else {
    await m.db.query(`
      UPDATE usuarios 
      SET exp = exp + $1, lastclaim = $2, dailystreak = $3
      WHERE id = $4
    `, [الخبرة_الحالية, الآن, سلسلة_جديدة, m.sender]);
  }

  await conn.fakeReply(
    m.chat,
    `*🎁 مكافأتك اليومية:*\n> +${formatNumber(الخبرة_الحالية)} نقطة خبرة (اليوم ${سلسلة_جديدة})\n${نص_المكافأة}> _لا تنسَ المطالبة غدًا لتحصل على: ${formatK(الخبرة_التالية)} (${formatNumber(الخبرة_التالية)}) XP_`,
    '13135550002@s.whatsapp.net',
    `🎁 استلام المكافأة اليومية 🎁`,
    'status@broadcast'
  );
};

handler.help = ['يومي'];
handler.tags = ['اقتصاد'];
handler.command = ['يومي']; // اختصار عربي
handler.register = true;

export default handler;

// دالة تحويل الوقت
function msToTime(duration) {
  const totalSeconds = Math.floor(Math.max(0, duration) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}س ${minutes}د`;
}

// تنسيق الأرقام
function formatNumber(num) {
  return num.toLocaleString('ar-EG'); 
}

// تنسيق K
function formatK(num) {
  return (num / 1000).toFixed(1) + 'k'; 
}
