import { db, getSubbotConfig } from "../lib/postgres.js";

const handler = async (m, { args, conn, usedPrefix }) => {
  const id = conn.user?.id;
  if (!id) return;
  const cleanId = id.replace(/:\d+/, '');
  const config = await getSubbotConfig(id);
  const actuales = Array.isArray(config.prefix) ? config.prefix : [config.prefix];

  if (args.length === 0) {
    const lista = actuales.length > 0 ? actuales.map(p => `\`${p || '(بدون)'}\``).join(", ") : "بدون بادئة";
    return m.reply(`📌 *البادئات الحالية:* ${lista}

✏️ *أمثلة الاستخدام:*
• \`${usedPrefix}بادئة /\` _(يستجيب فقط لـ “/”)_
• \`${usedPrefix}بادئة 0\` _(بدون بادئة)_
• \`${usedPrefix}بادئة 0,#,!\` _(بدون، # و !)_`);
  }

  const entrada = args.join(" ").trim();
  if (entrada.toLowerCase() === "noprefix" || entrada === "0") {
    try {
      await db.query(
        `INSERT INTO subbots (id, prefix)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET prefix = $2 RETURNING prefix`,
        [cleanId, [""]]
      );
      return m.reply(`✅ تم تفعيل *الوضع بدون بادئة*. يمكنك الآن كتابة الأوامر مباشرة مثل:\n• \`قائمة\``);
    } catch (err) {
      console.error(err);
      return m.reply("❌ حدث خطأ أثناء حفظ البادئة، تأكد من قاعدة البيانات.");
    }
  }

  const lista = entrada
    .split(",")
    .map(p => p.trim())
    .map(p => (p === "0" ? "" : p))
    .filter((p, i, self) => self.indexOf(p) === i); // بدون تكرار

  if (lista.length === 0) return m.reply("❌ لم يتم التعرف على أي بادئة صالحة.");
  if (lista.length > 9) return m.reply("⚠️ يُسمح بحد أقصى 9 بادئات.");

  try {
    await db.query(
      `INSERT INTO subbots (id, prefix)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET prefix = $2 RETURNING prefix`,
      [cleanId, lista]
    );
    const nuevoTexto = lista.map(p => `\`${p || '(بدون)'}\``).join(", ");
    m.reply(`✅ تم تحديث البادئات إلى: ${nuevoTexto}`);
  } catch (err) {
    console.error(err);
    return m.reply("❌ حدث خطأ أثناء حفظ البادئات، يرجى إبلاغ المطور عبر الأمر: /ابلاغ");
  }
};

handler.help = ['بادئة'];
handler.tags = ['المالك'];
handler.command = /^بادئة$/i;
handler.owner = true;

export default handler;
