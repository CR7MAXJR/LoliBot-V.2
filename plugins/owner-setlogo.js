import { db } from "../lib/postgres.js";

const handler = async (m, { args, conn }) => {
  const id = conn.user?.id;
  if (!id) return;

  const url = args[0];
  if (!url || !url.startsWith("http"))
    return m.reply("❌ يرجى إرسال رابط صورة صحيح.\n\nمثال:\nتغيير-الشعار https://i.imgur.com/logo.jpg");

  await db.query(`UPDATE subbots SET logo_url = $1 WHERE id = $2`, [
    url,
    id.replace(/:\d+/, '')
  ]);

  m.reply("✅ تم تحديث شعار/صورة البوت بنجاح.");
};

handler.help = ["تغيير-الشعار <الرابط>"];
handler.tags = ["المالك"];
handler.command = /^تغيير-الشعار$/i;
handler.register = true;
handler.owner = true;

export default handler;
