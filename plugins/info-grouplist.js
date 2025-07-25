import { db } from '../lib/postgres.js';

const handler = async (m, { conn }) => {
  const botId = (conn.user?.id || '').split(':')[0].replace('@s.whatsapp.net', '');
  let txt = '';
  try {
    const res = await db.query(`SELECT id FROM chats
      WHERE is_group = true AND joined = true AND bot_id = $1`, [botId]);
    const grupos = res.rows;
    if (grupos.length === 0) return m.reply('❌ البوت غير موجود في أي مجموعة حالياً.');

    for (let i = 0; i < grupos.length; i++) {
      const jid = grupos[i].id;
      const metadata = await conn.groupMetadata(jid).catch(() => null);
      if (!metadata) continue;

      const botJid = conn.user?.id?.replace(/:\d+/, '');
      const bot = metadata.participants.find(u => u.id === botJid) || {};
      const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
      const isParticipant = metadata.participants.some(u => u.id === botJid);
      const participantStatus = isParticipant ? '✅ *أنا موجود في المجموعة*' : '❌ *لست موجودًا في المجموعة*';

      let link = '❌ لست مشرفًا';
      if (isBotAdmin) {
        const code = await conn.groupInviteCode(jid).catch(() => null);
        if (code) link = `https://chat.whatsapp.com/${code}`;
        else link = '⚠️ حدث خطأ أثناء توليد رابط الدعوة';
      }

      txt += `${i + 1}. ${metadata.subject || 'مجموعة بدون اسم'} | ${participantStatus}\n- *معرّف المجموعة:* ${jid}\n- *هل أنا مشرف؟:* ${isBotAdmin ? 'نعم' : 'لا'}\n- *عدد الأعضاء:* ${metadata.participants.length}\n- *رابط الدعوة:* ${link}\n\n━━━━━━━━━━━━━━━\n\n`;
    }

    m.reply(`_*\`قائمة المجموعات التي أنا فيها:\`*_\n> *• عدد المجموعات:* ${grupos.length}\n\n${txt}`.trim());
  } catch (err) {
    console.error(err);
    m.reply('❌ حدث خطأ أثناء جلب قائمة المجموعات.');
  }
};

handler.help = ['المجموعات', 'قائمة_المجموعات'];
handler.tags = ['main'];
handler.command = /^(المجموعات|قائمة_المجموعات|قائمةالمجموعات|قائمة-المجموعات)$/i;
handler.register = true;

export default handler;
