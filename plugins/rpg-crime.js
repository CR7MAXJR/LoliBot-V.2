// كود معرب بواسطة July harmon - مبني على كود elrebelde21
import { xpRange } from '../lib/levelling.js'

const cooldown = 3600000; // ساعة واحدة

const handler = async (m, { conn, metadata }) => {
  const now = Date.now();
  const userRes = await m.db.query('SELECT exp, limite, money, crime FROM usuarios WHERE id = $1', [m.sender]);
  const user = userRes.rows[0];
  if (!user) return m.reply('❌ أنت غير مسجل في قاعدة البيانات.');

  const timePassed = now - (user.crime || 0);
  if (timePassed < cooldown) return m.reply(`『🚓︎』الشرطة تراقبك، عد بعد: ${msToTime(cooldown - timePassed)}`);

  const participants = metadata.participants.map(v => v.id);
  const randomTarget = participants[Math.floor(Math.random() * participants.length)];
  const exp = Math.floor(Math.random() * 7000);
  const diamond = Math.floor(Math.random() * 30);
  const money = Math.floor(Math.random() * 9000);
  const type = Math.floor(Math.random() * 5);

  let text = '';
  switch (type) {
    case 0:
      text = `《💰》${pickRandom(robar)} ${exp} نقطة خبرة.`;
      await m.db.query('UPDATE usuarios SET exp = exp + $1, crime = $2 WHERE id = $3', [exp, now, m.sender]);
      break;
    case 1:
      text = `《🚓》${pickRandom(robmal)} ${exp} نقطة خبرة.`;
      await m.db.query('UPDATE usuarios SET exp = GREATEST(exp - $1, 0), crime = $2 WHERE id = $3', [exp, now, m.sender]);
      break;
    case 2:
      text = `《💰》${pickRandom(robar)}\n\n💎 ${diamond} ألماسة\n🪙 ${money} عملة`;
      await m.db.query('UPDATE usuarios SET limite = limite + $1, money = money + $2, crime = $3 WHERE id = $4', [diamond, money, now, m.sender]);
      break;
    case 3:
      text = `《🚓》${pickRandom(robmal)}\n\n💎 ${diamond} ألماسة\n🪙 ${money} عملة`;
      await m.db.query('UPDATE usuarios SET limite = GREATEST(limite - $1, 0), money = GREATEST(money - $2, 0), crime = $3 WHERE id = $4', [diamond, money, now, m.sender]);
      break;
    case 4:
      text = `《💰》لقد سرقت من @${randomTarget.split('@')[0]} كمية ${exp} نقطة خبرة!`;
      await m.db.query('UPDATE usuarios SET exp = exp + $1, crime = $2 WHERE id = $3', [exp, now, m.sender]);
      await m.db.query('UPDATE usuarios SET exp = GREATEST(exp - $1, 0) WHERE id = $2', [500, randomTarget]);
      break;
  }

  return conn.sendMessage(m.chat, { text, mentions: [m.sender, randomTarget] }, { quoted: m });
};

handler.help = ['سرقة'];
handler.tags = ['اقتصاد'];
handler.command = /^سرقة$/i;
handler.register = true;
handler.group = true;

export default handler;

function msToTime(duration) {
  const minutes = Math.floor((duration / 1000 / 60) % 60);
  const hours = Math.floor((duration / 1000 / 60 / 60) % 24);
  return `${hours.toString().padStart(2, '0')} ساعة و ${minutes.toString().padStart(2, '0')} دقيقة`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let robar = [
  'سرقت بنك 🏦 وحصلت على',
  'اتّفقت مع زعيم المافيا وحصلت على:',
  'كادت الشرطة أن تمسك بك، لكنك هربت وغنمت:',
  'المافيا دفعت لك:',
  'سرقت من مشرف المجموعة:',
  'سرقت رئيس الدولة وحصلت على:',
  'سرقت شخص مشهور بقيمة:',
  'تسللت إلى متحف وسرقت قطعة فنية نادرة:',
  'اقتحمت محل مجوهرات وحصلت على كنز:',
  'أصبحت اللص الأكثر طلبًا في البلاد وحصلت على:',
  'سرقت شاحنة محملة بالبضائع الغالية وحصلت على:',
  'هجمت على قطار وسلبت:',
  'سرقت طائرة مليئة بالبضائع وحصلت على:',
  'تظاهرت أنك مليونير وسرقت جوهرة ثمينة:',
  'اقتحمت بيت جامع تحف وسرقت قطعة فريدة:',
  'خطفّت رجل أعمال وطلبت فدية ضخمة:',
  'ابتزيت سياسيًا وأخذت مبلغًا كبيرًا:',
  'رشيت شرطيًا للحصول على معلومات سرية، فربحت:'
];

let robmal = [
  'رأتك الشرطة 🙀👮‍♂️ وخسرت',
  'ذهبت لسرقة بنك 🏦 لكن مساعدك خانك وخسرت:',
  'لم تتمكن من الهرب من الشرطة 🚔🤡 وخسرت:',
  'حاولت سرقة كازينو وتم كشفك، خسرت:',
  'أمسكوا بك أثناء محاولة سرقة متجر، خسرت:',
  'انطلقت صفارات الإنذار أثناء محاولتك سرقة مستودع، خسرت:',
  'مالك المكان قبض عليك متلبسًا، خسرت:',
  'حاولت اختراق بنك إلكتروني وتم تتبعك، خسرت:',
  'تم كشفك وأنت تحاول رشوة شرطي، خسرت:',
  'خطتك لابتزاز رجل أعمال فشلت، خسرت:',
];
