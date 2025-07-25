import { db } from '../lib/postgres.js';

let linkRegex1 = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|5chat-whatzapp\.vercel\.app/i;
let linkRegex2 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i;

export async function before(m, { conn }) {
  if (!m.isGroup || !m.originalText) return;

  const userTag = `@${m.sender.split('@')[0]}`;
  const bang = m.key.id;
  const delet = m.key.participant || m.sender;

  try {
    const res = await db.query('SELECT antilink FROM group_settings WHERE group_id = $1', [m.chat]);
    const config = res.rows[0];
    if (!config || !config.antilink) return;
  } catch (e) {
    console.error(e);
    return;
  }

  const isGroupLink = linkRegex1.test(m.originalText) || linkRegex2.test(m.originalText);
  if (!isGroupLink) return;

  const metadata = await conn.groupMetadata(m.chat);
  const botId = conn.user?.id?.replace(/:\d+@/, "@");
  const isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin);
  const isSenderAdmin = metadata.participants.some(p => p.id === m.sender && p.admin);

  if (isSenderAdmin || m.fromMe) return;

  if (conn.groupInviteCode) {
    try {
      const code = await conn.groupInviteCode(m.chat);
      if (m.originalText.includes(`https://chat.whatsapp.com/${code}`)) return;
    } catch {}
  }

  if (!isBotAdmin) {
    return await conn.sendMessage(m.chat, {
      text: `*「 🚫 تم اكتشاف رابط 」*\n\n${userTag}، أرسلت رابطًا لكن لا يمكنني طردك لأني لست مشرفًا.`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `*「 🚫 تم اكتشاف رابط 」*\n\n${userTag}، لقد خالفت قواعد المجموعة وسيتم طردك.`,
    mentions: [m.sender]
  }, { quoted: m });

  try {
    await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }});
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
  } catch (err) {
    console.error(err);
  }
}
