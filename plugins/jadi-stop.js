import fs from "fs";
import path from "path";

const handler = async (m, { conn }) => {
  const rawId = conn.user?.id || "";
  const cleanId = rawId.replace(/:\d+/, ""); // إزالة :16 أو :17
  const sessionPath = path.join("jadibot", cleanId);
  const isSubBot = fs.existsSync(sessionPath);

  if (!isSubBot) return m.reply("⚠️ هذا الأمر يمكن استخدامه فقط من داخل جلسة *بوت فرعي*.");

  try {
    await m.reply("👋 وداعًا، سأشتاق إليك...");
    await conn.logout();

    setTimeout(() => {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`[بوت فرعي ${cleanId}] تم تسجيل الخروج وحذف الجلسة.`);
      }
    }, 2000);

    setTimeout(() => {
      m.reply("✅ *تم إنهاء جلسة البوت الفرعي بنجاح.*\nيمكنك إعادة الاتصال باستخدام الأمر `/jadibot` أو `/serbot`.");
    }, 3000);

  } catch (err) {
    console.error(`❌ خطأ أثناء إنهاء البوت الفرعي ${cleanId}:`, err);
    await m.reply("❌ حدث خطأ أثناء محاولة إنهاء جلسة البوت الفرعي.");
  }
};

handler.help = ['ايقاف'];
handler.tags = ['بوت_فرعي'];
handler.command = /^ايقاف$/i;
handler.owner = true;
handler.private = true;
handler.register = true;

export default handler;
