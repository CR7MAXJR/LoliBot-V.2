import { db } from '../lib/postgres.js';

let handler = async (m, { conn }) => {
  try {
    const [
      usuarios,
      registrados,
      chats,
      grupos,
      mensajes,
      tablasRes,
      totalSize
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM usuarios'),
      db.query('SELECT COUNT(*) FROM usuarios WHERE registered = true'),
      db.query('SELECT COUNT(*) FROM chats'),
      db.query("SELECT COUNT(*) FROM group_settings WHERE welcome IS NOT NULL"),
      db.query('SELECT SUM(message_count) FROM messages'),
      db.query(`
        SELECT relname AS tabla,
               n_live_tup AS filas,
               pg_size_pretty(pg_total_relation_size(relid)) AS tamaño
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC;
      `),
      db.query(`
        SELECT pg_size_pretty(SUM(pg_total_relation_size(relid))) AS total
        FROM pg_stat_user_tables;
      `)
    ]);

    const totalUsuarios = usuarios.rows[0].count;
    const totalRegistrados = registrados.rows[0].count;
    const totalChats = chats.rows[0].count;
    const totalGrupos = grupos.rows[0].count;
    const totalMensajes = mensajes.rows[0].sum || 0;
    const tamañoTotalBD = totalSize.rows[0].total;

    let texto = `📊 *إحصائيات قاعدة البيانات:*\n`;
    texto += `> 👤 المستخدمون: *${totalUsuarios}*\n`;
    texto += `> ✅ المسجلون: *${totalRegistrados}*\n`;
    texto += `> 💬 جميع الدردشات: *${totalChats}*\n`;
    texto += `> 👥 المجموعات النشطة: *${totalGrupos}*\n`;
    texto += `> 💌 عدد الرسائل: *${totalMensajes}*\n`;
    texto += `> 💾 الحجم الكلي للقاعدة: *${tamañoTotalBD}*\n\n`;

    texto += `📁 *تفاصيل الحجم حسب الجداول:*\n`;
    for (const row of tablasRes.rows) {
      texto += `• *${row.tabla}*: ${row.filas} صفوف — ${row.tamaño}\n`;
    }

    await m.reply(texto);
  } catch (err) {
    console.error("❌ خطأ في أمر قاعدة البيانات:", err);
    await m.reply('❌ حدث خطأ أثناء جلب بيانات القاعدة.');
  }
};

handler.help = ['قاعدة'];
handler.tags = ['owner'];
handler.command = /^قاعدة$/i;
handler.rowner = true;

export default handler;
