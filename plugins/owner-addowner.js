import { db, getSubbotConfig } from '../lib/postgres.js';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const id = conn.user?.id;
  if (!id) return;
  const botId = id.replace(/:\d+/, '');

  let jidToSave = m.mentionedJid?.[0];
  if (!jidToSave && args[0]) {
    const input = args[0].replace(/^\+/, '').replace(/[^0-9]/g, '');
    if (input.length >= 7) jidToSave = `${input}@s.whatsapp.net`;
  }

  if (!jidToSave)
    return m.reply(`❌ يجب أن تذكر شخصًا أو تكتب رقمًا صحيحًا.\nمثال: ${usedPrefix + command} +20123456789 أو ${usedPrefix + command} @${m.sender}`);

  const display = jidToSave.replace(/@.+/, '');
  const config = await getSubbotConfig(botId);
  if (!Array.isArray(config.owners)) config.owners = [];

  try {
    if (command === "اضف-مالك") {
      if (config.owners.includes(jidToSave))
        return m.reply(`⚠️ @${display} هو بالفعل مالك.`, { mentions: [jidToSave] });

      config.owners.push(jidToSave);
      await db.query(`INSERT INTO subbots (id, owners)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET owners = $2 RETURNING owners`, [botId, config.owners]);

      console.log(`✅ تمت إضافة المالك: ${jidToSave} للبوت ${botId}`);
      return m.reply(`✅ تم تعيين @${display} كمالك فرعي.`, { mentions: [jidToSave] });
    }

    if (command === "احذف-مالك") {
      if (!config.owners.includes(jidToSave))
        return m.reply(`⚠️ @${display} ليس من المالكين.`, { mentions: [jidToSave] });

      config.owners = config.owners.filter(j => j !== jidToSave);
      await db.query(`INSERT INTO subbots (id, owners)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET owners = $2 RETURNING owners`, [botId, config.owners]);

      console.log(`✅ تم حذف المالك: ${jidToSave} من البوت ${botId}`);
      return m.reply(`✅ تم حذف @${display} من قائمة المالكين.`, { mentions: [jidToSave] });
    }

  } catch (err) {
    console.error(err);
  }
};

handler.help = ["اضف-مالك", "احذف-مالك"];
handler.tags = ["بوتات"];
handler.command = /^(اضف-مالك|احذف-مالك)$/i;
handler.owner = true;
handler.register = true;

export default handler;
