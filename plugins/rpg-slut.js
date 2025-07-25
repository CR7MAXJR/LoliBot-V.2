const handler = async (m, { conn }) => {
  const cooldown = 600_000; // 10 دقائق
  const now = Date.now();
  const res = await m.db.query('SELECT exp, lastslut FROM usuarios WHERE id = $1', [m.sender]);
  const user = res.rows[0];
  const lastSlut = Number(user?.lastslut) || 0;
  const remaining = Math.max(0, lastSlut + cooldown - now);

  if (remaining > 0)
    return conn.reply(m.chat, `💦 يجب أن تنتظر ${msToTime(remaining)} قبل أن تخرج في مشوار آخر...`, m);

  const ganancias = Math.floor(Math.random() * 2500) + 1000;
  const النص = slut.getRandom();

  await m.db.query(`UPDATE usuarios SET exp = exp + $1, lastslut = $2 WHERE id = $3`, [ganancias, now, m.sender]);
  await conn.reply(m.chat, `*${النص}*\n\nربحت: *${formatNumber(ganancias)} XP*`, m);
};

handler.help = ['مشوار'];
handler.tags = ['rpg', 'hot'];
handler.command = /^مشوار$/i;
handler.register = true;

export default handler;

const slut = [
  "بعت نفسك مقابل وجبة من ماكدونالدز",
  "سويت شغل خاص مع الأدمن وكافئك",
  "سويت رقصة مغرية للأدمن وأعطاك بقشيش",
  "حسابك في OnlyFans انفجر 10 دقائق فجأة",
  "العميل كان فوري ودفعلّك دبل",
  "لبست لبس خادمة وضبطت معك",
  "الشيبة في القروب عطاك بقشيش",
  "عرضت حضن بفلوس، وفهموك غلط",
  "اشتغلت على زاوية مظلمة في سان أندرياس",
  "دفعوا لك علشان تسكت... وسكت تمام",
  "رحت المنطقة الحمراء ورجعت بفلوس",
  "تنكرت بزي نيزوكو وولّعت الجو",
  "سويت تمثيل مع البوت وكافأوك على التزامك بالدور",
  "تنكرت كإيموجي وواحد دفعلك علشان يستخدمك",
  "شوجر دادي أعطاك XP مقابل دلع",
  "دخلت تحدي (حقيقة أو تحدي) وانفلتت الأمور",
  "صورتك جذبت تبرعات بقروب العزاب",
  "أجّرت نفسك كخلفية جوال مخصصة",
  "بعت بوسات رقمية وكسبت كثير",
  "الوايفو اللي بداخلك اشتغلت وجابت فلوس",
  "صورة بروفايلك أعجبت مشرف وكافئك",
  "قبلت تطلع مع شخص ما يتكلم إلا استكرات",
  "لبست لبس بوت NSFW وما حد لاحظ الفرق",
  "سويت دويتو تيك توك حار وربحت",
  "VTuber وظفك كمساعد شخصي جريء",
  "استيكراتك انتشرت وطلبت نسبة",
  "أرسلوا لك فلوس بس علشان تقول (دادي) بصوتك",
  "تنكرت مثل سيري وطلبوا منك أوامر غريبة",
  "قدّمت دروس خصوصية مشبوهة في القروب",
  "كنت نجم سهرة في كازينو RPG",
  "بعت صور رجلين مرسومة بنص ASCII",
  "أجّرت نفسك كشخصية NPC مثيرة",
  "شاركت في فعالية حارة في سيرفر ماينكرافت",
  "سويت أشياء مشبوهة للأدمن مقابل XP",
  "سجلت أوامر بصوتك وبعتها بفلوس",
  "سويت حساب OnlyBots وصرت ترند",
  "تظاهرت إنك مشرف مغري وفرضت غرامات",
  "اسمك طلع في فان فيك وكافئك الكاتب",
  "نظمت حفلة نعلات افتراضية بتذاكر مدفوعة",
  "رقصت لبوت الاقتصاد وسحب لك رصيده"
];

function formatNumber(num) {
  return num.toLocaleString("en").replace(/,/g, ".");
}

function msToTime(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} دقيقة و ${seconds} ثانية`;
}
