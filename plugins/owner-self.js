import { db, getSubbotConfig } from "../lib/postgres.js";

const handler = async (m, { args, conn, usedPrefix, command }) => {
  const id = conn.user?.id;
  if (!id) return;
  const cleanId = id.replace(/:\d+/, '');

  const input = args[0]?.toLowerCase();
  if (!["on", "off", "private", "public", "تشغيل", "ايقاف", "إيقاف"].includes(input)) {
    return m.reply(`⚙️ الاستخدام الصحيح:\n*${usedPrefix + command} تشغيل* أو *${usedPrefix + command} إيقاف*`);
  }

  const nuevoModo = ["on", "private", "تشغيل"].includes(input) ? "private" : "public";
  try {
    const res = await db.query(`
      INSERT INTO subbots (id, mode)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET mode = $2 RETURNING mode
    `, [cleanId, nuevoModo]);

    const estado = nuevoModo === "private" ? "🔒 الوضع: *خاص*" : "🌐 الوضع: *عام*";
    m.reply(`✅ تم تغيير وضع البوت إلى: ${estado}`);
  } catch (err) {
    console.error(err);
    m.reply("❌ حدث خطأ أثناء تغيير الوضع.");
  }
};

handler.help = ['وضع'];
handler.tags = ['بوت_فرعي'];
handler.command = /^وضع|وضع_البوت|modoprivado|self|modoprivate$/i;
handler.owner = true;

export default handler;
