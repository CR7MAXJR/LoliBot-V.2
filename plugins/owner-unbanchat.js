import { db } from "../lib/postgres.js";

const handler = async (m, { conn }) => {
  await db.query(`
    INSERT INTO group_settings (group_id, banned)
    VALUES ($1, false)
    ON CONFLICT (group_id) DO UPDATE SET banned = false
  `, [m.chat]);

  m.reply("✅ تم *إلغاء حظر* هذا الجروب، البوت سيعود للعمل هنا.");
}

handler.help = ['الغاء-الحظر'];
handler.tags = ['المالك'];
handler.command = /^الغاء-الحظر$/i;
handler.owner = true;

export default handler;
