import { db } from "../lib/postgres.js";

const handler = async (m, { conn, args }) => {
  const id = conn.user?.id;
  if (!id) return m.reply("❌ لم يتم التعرف على هذا البوت.");
  const cleanId = id.replace(/:\d+/, '');

  try {
    const tipoFiltro = args[0] === '1' ? 'oficial' : args[0] === '2' ? 'subbot' : null;
    const [res, conteo] = await Promise.all([
      db.query(`SELECT * FROM subbots${tipoFiltro ? ` WHERE tipo = '${tipoFiltro}'` : ''}`),
      tipoFiltro ? null : db.query(`SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE tipo = 'oficial') AS oficiales,
        COUNT(*) FILTER (WHERE tipo = 'subbot') AS subbots
      FROM subbots`)
    ]);

    if (res.rows.length === 0) {
      return m.reply(tipoFiltro
        ? `❌ لا يوجد أي بوت من النوع *${tipoFiltro === 'oficial' ? 'رئيسي' : 'فرعي'}* في قاعدة البيانات.`
        : "❌ جدول البوتات فارغ، لا يوجد ما يُعرض.");
    }

    let mensaje = `📋 *قائمة البوتات${tipoFiltro ? ` (${tipoFiltro === 'oficial' ? 'رئيسية' : 'فرعية'})` : ''}:*\n`;

    if (!tipoFiltro && conteo) {
      const { total, oficiales, subbots } = conteo.rows[0];
      mensaje += `*• الرئيسية:* ${oficiales}\n`;
      mensaje += `*• الفرعية:* ${subbots}\n\n`;
      mensaje += `\`⚙️ الإعدادات:\`\n`;
    }
    
    for (const row of res.rows) {
      mensaje += `- 🆔 المعرف: ${row.id} (${row.tipo === 'oficial' ? 'رئيسي' : row.tipo === 'subbot' ? 'فرعي' : 'غير معروف'})\n`;
      mensaje += `- 🔘 الوضع: ${row.mode || 'عام'}\n`;
      mensaje += `- 📛 الاسم: ${row.name || 'افتراضي'}\n`;
      mensaje += `- ☑️ البادئات: ${row.prefix ? row.prefix.join(', ') : '[/,.,#]'}\n`;
      mensaje += `- 👑 المالكين: ${row.owners?.length ? row.owners.join(', ') : 'افتراضي'}\n`;
      mensaje += `- 🔒 منع الخاص: ${row.anti_private ? '✅ نعم' : '❌ لا'}\n`;
      mensaje += `- 📵 منع الاتصالات: ${row.anti_call ? '✅ نعم' : '❌ لا'}\n`;
      mensaje += `- 🔐 إخفاء الرقم: ${row.privacy ? '✅ نعم' : '❌ لا'}\n`;
      mensaje += `- 🤝 قابل للإعارة: ${row.prestar ? '✅ نعم' : '❌ لا'}\n`;
      mensaje += `- 🖼️ الشعار: ${row.logo_url || 'لا يوجد'}\n`;
      mensaje += `\n─────────────\n\n`;
    }

    m.reply(mensaje.trim());

  } catch (err) {
    console.error("❌ خطأ أثناء جلب البوتات:", err);
    m.reply("❌ حصل خطأ أثناء قراءة جدول البوتات، يرجى الإبلاغ.");
  }
};

handler.help = ['قائمة-البوتات [اختياري: 1|2]'];
handler.tags = ['المالك'];
handler.command = /^قائمة-البوتات$/i;
handler.register = true;
handler.owner = true;

export default handler;
