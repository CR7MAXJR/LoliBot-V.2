import { db } from '../lib/postgres.js';

const maxwarn = 3;

let handler = async (m, { conn, text, args, usedPrefix, command, metadata }) => {
  try {
    let who;
    if (m.isGroup) {
      who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    } else {
      who = m.chat;
    }

    if (!who)
      return m.reply(`*🚫 من تريد تحذيره؟*\nيرجى الإشارة إلى الشخص باستخدام @العلامة أو اقتباس رسالته.`);

    const userResult = await db.query(`SELECT * FROM usuarios WHERE id = $1`, [who]);
    if (!userResult.rows.length)
      return m.reply(`*⚠️ لا أستطيع العثور على هذا المستخدم في قاعدة البيانات.*`);

    const name = (await conn.getName(m.sender)) || m.sender.split('@')[0];
    let warn = userResult.rows[0].warn || 0;

    if (warn < maxwarn) {
      await db.query(
        `UPDATE usuarios SET warn = warn + 1 WHERE id = $1`,
        [who]
      );
      warn += 1;

      let reason = text.trim() || 'لم تُذكر';
      await conn.reply(
        m.chat,
        `*⚠️ تحذير ⚠️*\n\n@${who.split`@`[0]} تم تحذيرك بواسطة المشرف: ${name}\n*• عدد التحذيرات:* ${warn}/${maxwarn}\n*• السبب:* ${reason}`,
        m
      );
    } else if (warn >= maxwarn) {
      await db.query(
        `UPDATE usuarios SET warn = 0 WHERE id = $1`,
        [who]
      );
      await conn.reply(
        m.chat,
        `*🚨 تجاوز @${who.split`@`[0]} الحد الأقصى من التحذيرات (${maxwarn}) وسيتم طرده من المجموعة...*`,
        m
      );
      await delay(3000);
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    }
  } catch (err) {
    console.error(err);
  }
};

handler.help = ['تحذير @user [السبب]'];
handler.tags = ['group'];
handler.command = /^تحذير$/i; // اسم الأمر الآن "تحذير"
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.register = true;

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
