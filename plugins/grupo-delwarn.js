import { db } from '../lib/postgres.js';

let handler = async (m, { conn, args, usedPrefix, command, metadata }) => {
  try {
    let who;
    if (m.isGroup) {
      who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    } else {
      who = m.chat;
    }

    if (!who) return m.reply(`*🚫 من الشخص الذي تريد إزالة تحذير عنه؟*\nيرجى الإشارة إلى شخص باستخدام @tag أو اقتباس رسالته.`);

    const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
    if (!userResult.rows.length) return m.reply(`*🚫 لم أجد هذا المستخدم في قاعدة البيانات.*\nتأكد من الإشارة إليه بـ @tag أو اقتباس رسالته.`);

    let warn = userResult.rows[0].warn || 0;

    if (warn > 0) {
      await db.query(`UPDATE usuarios SET warn = warn - 1 WHERE id = $1`, [who]);
      warn -= 1;
      await conn.reply(m.chat, `*⚠️ تم إزالة تحذير ⚠️*\n\n👤 المستخدم: @${who.split`@`[0]}\n➖ *تحذير:* -1\n📊 *المجموع الآن:* ${warn}`, m);
    } else {
      await conn.reply(m.chat, `*✅ المستخدم @${who.split`@`[0]} ليس لديه أي تحذيرات حالياً.*`, m);
    }
  } catch (err) {
    console.error(err);
    m.reply('❌ حدث خطأ أثناء محاولة إزالة التحذير.');
  }
};

handler.help = ['delwarn @user', 'unwarn @user', 'ازالةتحذير @user', 'حذفتحذير @user'];
handler.tags = ['group'];
handler.command = /^(delwarn|unwarn|ازالةتحذير|حذفتحذير)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
