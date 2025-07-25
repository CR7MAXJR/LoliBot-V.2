import { db } from "../lib/postgres.js";

const handler = async (m, { args, conn }) => {
  const id = conn.user?.id;
  if (!id) return;
  const name = args.join(" ").trim();
  if (!name) return m.reply("❌ اكتب اسمًا جديدًا للبوت.\n\nمثال:\n.اسم-البوت لولي بوت 😎");
  
  await db.query(`UPDATE subbots SET name = $1 WHERE id = $2`, [name, id.replace(/:\d+/, '')]);
  m.reply(`✅ تم تحديث اسم البوت إلى:\n*${name}*`);
};

handler.help = ["اسم-البوت <الاسم>"];
handler.tags = ["البوتات"];
handler.command = /^اسم-البوت$/i;
handler.register = true;
handler.owner = true;

export default handler;
