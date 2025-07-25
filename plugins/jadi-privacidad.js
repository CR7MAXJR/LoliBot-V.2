import { db } from '../lib/postgres.js'

let handler = async (m, { conn, command, args, usedPrefix }) => {
  const val = args[0];
  if (!['1', '0'].includes(val)) {
    return m.reply(`✳️ الاستخدام:\n${usedPrefix}${command} 1 (تفعيل)\n${usedPrefix}${command} 0 (تعطيل)`);
  }

  const id = conn.user?.id;
  if (!id) return;
  const botId = id.replace(/:\d+/, '');

  try {
    if (/خصوصي/i.test(command)) {
      const privacyVal = val === '1'; 
      await db.query(`INSERT INTO subbots (id, privacy)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET privacy = $2 RETURNING privacy`, [botId, privacyVal]);
      return m.reply(privacyVal 
        ? '✅ *تم تفعيل وضع الخصوصية.*\nلن يظهر رقمك في قائمة البوتات.' 
        : '✅ *تم إلغاء وضع الخصوصية.*\nسيظهر رقمك في قائمة البوتات.');
    }

    if (/اعارة/i.test(command)) {
      const prestarVal = val === '1'; 
      await db.query(`INSERT INTO subbots (id, prestar)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET prestar = $2 RETURNING prestar`, [botId, prestarVal]);
      return m.reply(prestarVal 
        ? '✅ *تم تفعيل إتاحة إعارة البوت.*\nيمكن للمستخدمين استخدام بوتك للانضمام إلى مجموعاتهم.' 
        : '✅ *تم تعطيل إعارة البوت.*\nلن يتمكن المستخدمون من استخدام البوت للانضمام إلى مجموعاتهم.');
    }
  } catch (err) {
    console.error(err);
  }
}

handler.help = ['خصوصي', 'اعارة']
handler.tags = ['jadibot']
handler.command = /^(خصوصي|اعارة)$/i
handler.owner = true
handler.register = true

export default handler
