import { db } from "../lib/postgres.js";

let handler = async (m, { command, text }) => {
  let who = m.isGroup ? m.mentionedJid?.[0] : m.chat;
  if (!who) return m.reply("⚠️ الرجاء الإشارة إلى الشخص باستخدام @العلامة.");
  let idFinal = who;

  if (idFinal.includes("@lid")) {
    const result = await db.query(`SELECT num FROM usuarios WHERE lid = $1`, [idFinal]);
    if (!result.rowCount) return m.reply("❌ لم يتم العثور على هذا المستخدم في قاعدة البيانات.");
    const numero = result.rows[0].num;
    idFinal = numero + "@s.whatsapp.net";
  }

  const cleanJid = idFinal.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  const cantidad = parseInt(text.match(/\d+/)?.[0]);
  if (!cantidad || isNaN(cantidad)) return m.reply("⚠️ الرجاء إدخال كمية صالحة.");

  try {
    const res = await db.query(`SELECT id FROM usuarios WHERE id = $1`, [cleanJid]);
    if (!res.rowCount) return m.reply("❌ هذا المستخدم غير مسجل في قاعدة البيانات.");

    let resultado;

    if (/^(اضف-ماس)$/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET limite = limite + $1 WHERE id = $2 RETURNING limite`, [cantidad, cleanJid]);
      return m.reply(`*≡ 💎 تم إضافة ماسات:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    if (/^(احذف-ماس)$/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET limite = GREATEST(0, limite - $1) WHERE id = $2 RETURNING limite`, [cantidad, cleanJid]);
      return m.reply(`*≡ 💎 تم حذف ماسات:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    if (/^(اضف-خبرة)$/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET exp = exp + $1 WHERE id = $2 RETURNING exp`, [cantidad, cleanJid]);
      return m.reply(`*≡ ✨ تم إضافة خبرة:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }

    if (/^(احذف-خبرة)$/i.test(command)) {
      resultado = await db.query(`UPDATE usuarios SET exp = GREATEST(0, exp - $1) WHERE id = $2 RETURNING exp`, [cantidad, cleanJid]);
      return m.reply(`*≡ ✨ تم حذف خبرة:*\n┏━━━━━━━━━━━━\n┃• *الكمية:* ${cantidad}\n┗━━━━━━━━━━━━`);
    }
  } catch (e) {
    console.error(e);
    return m.reply("❌ حدث خطأ أثناء تعديل البيانات.");
  }
};

handler.help = ['اضف-ماس', 'احذف-ماس', 'اضف-خبرة', 'احذف-خبرة'];
handler.tags = ['owner'];
handler.command = /^(اضف-ماس|احذف-ماس|اضف-خبرة|احذف-خبرة)$/i;
handler.owner = true;
handler.register = true;

export default handler;
