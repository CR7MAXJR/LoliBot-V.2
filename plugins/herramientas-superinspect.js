// كود معدل من قبل https://github.com/GataNina-Li
// الكود متوافق مع القنوات والمجتمعات في واتساب

import { getUrlFromDirectPath } from "@whiskeysockets/baileys";
import _ from "lodash";
import axios from 'axios';

let handler = async (m, { conn, command, usedPrefix, args, text, groupMetadata, isOwner, isROwner }) => {
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
let thumb = m.pp;
let pp, inviteCode, info;

if (!text) return await m.reply(`*⚠️ يرجى إدخال رابط مجموعة أو قناة أو مجتمع واتساب للحصول على المعلومات.*`);

const MetadataGroupInfo = async (res) => {
let اسم_المجتمع = "لا ينتمي لأي مجتمع";
let صورة_المجموعة = "تعذر الحصول عليها";

if (res.linkedParent) {
let linkedGroupMeta = await conn.groupMetadata(res.linkedParent).catch(e => null);
اسم_المجتمع = linkedGroupMeta ? "\n" + ("`الاسم:` " + linkedGroupMeta.subject || "") : اسم_المجتمع;
}
pp = await conn.profilePictureUrl(res.id, 'image').catch(e => null);
inviteCode = await conn.groupInviteCode(m.chat).catch(e => null);

const المشاركون = (participants) =>
participants?.length
? participants.map((u, i) => `${i + 1}. @${u.id?.split("@")[0]}${u.admin === "superadmin" ? " (مشرف عام)" : u.admin === "admin" ? " (مشرف)" : ""}`).join("\n")
: "لا يوجد";

let نص = `🆔 *معرّف المجموعة:*\n${res.id || "غير متوفر"}\n\n` +
`👑 *أنشأها:*\n${res.owner ? `@${res.owner?.split("@")[0]}` : "غير معروف"} ${res.creation ? `بتاريخ ${formatDate(res.creation)}` : "(تاريخ غير متوفر)"}\n\n` +
`🏷️ *الاسم:*\n${res.subject || "غير متوفر"}\n\n` +
`✏️ *غيّر الاسم:*\n${res.subjectOwner ? `@${res.subjectOwner?.split("@")[0]}` : "غير معروف"} ${res.subjectTime ? `بتاريخ ${formatDate(res.subjectTime)}` : "(تاريخ غير متوفر)"}\n\n` +
`📄 *الوصف:*\n${res.desc || "غير متوفر"}\n\n` +
`📝 *من غيّر الوصف:*\n${res.descOwner ? `@${res.descOwner?.split("@")[0]}` : "غير معروف"}\n\n` +
`🗃️ *معرّف الوصف:*\n${res.descId || "غير متوفر"}\n\n` +
`🖼️ *صورة المجموعة:*\n${pp || صورة_المجموعة}\n\n` +
`💫 *الكاتب:*\n${res.author || "غير معروف"}\n\n` +
`🎫 *رمز الدعوة:*\n${res.inviteCode || inviteCode || "غير متاح"}\n\n` +
`⌛ *مدة الرسائل المؤقتة:*\n${res.ephemeralDuration !== undefined ? `${res.ephemeralDuration} ثانية` : "غير معروفة"}\n\n` +
`🛃 *المشرفون:*\n` +
(res.participants?.length
? res.participants.filter(u => u.admin === "admin" || u.admin === "superadmin").map((u, i) => `${i + 1}. @${u.id?.split("@")[0]}${u.admin === "superadmin" ? " (مشرف عام)" : " (مشرف)"}`).join("\n")
: "غير موجود") + `\n\n` +
`🔰 *عدد الأعضاء الكلي:*\n${res.size || "غير معروف"}\n\n` +
`✨ *معلومات متقدمة* ✨\n\n` +
`🔎 *المجتمع المرتبط:*\n${res.isCommunity ? "هذه مجموعة إعلانات" : `${res.linkedParent ? "`المعرف:` " + res.linkedParent : "هذه مجموعة عادية"} ${اسم_المجتمع}`}\n\n` +
`⚠️ *مقيد:* ${res.restrict ? "✅" : "❌"}\n` +
`📢 *إعلانات:* ${res.announce ? "✅" : "❌"}\n` +
`🏘️ *هل هي مجتمع؟:* ${res.isCommunity ? "✅" : "❌"}\n` +
`📯 *إعلان مجتمع؟:* ${res.isCommunityAnnounce ? "✅" : "❌"}\n` +
`🤝 *يتطلب موافقة للانضمام:* ${res.joinApprovalMode ? "✅" : "❌"}\n` +
`🆕 *إضافة أعضاء جدد:* ${res.memberAddMode ? "✅" : "❌"}\n`;

return نص.trim();
};

try {
let res = text ? null : await conn.groupMetadata(m.chat);
info = await MetadataGroupInfo(res);
console.log('باستخدام بيانات الميتاداتا');
} catch {
const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
if (inviteUrl) {
try {
let inviteInfo = await conn.groupGetInviteInfo(inviteUrl);
info = await MetadataGroupInfo(inviteInfo);
console.log('باستخدام رابط الدعوة');
} catch (e) {
m.reply('لم يتم العثور على المجموعة أو الرابط غير صالح');
return;
}}}

if (info) {
await conn.sendMessage(m.chat, {
text: info,
contextInfo: {
mentionedJid: null,
externalAdReply: {
title: "📊 أداة فحص المجموعات",
body: m.pushName,
thumbnailUrl: m.pp,
sourceUrl: args[0] ? args[0] : inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : md,
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: true
}
}}, { quoted: fkontak });
} else if (channelUrl) {
try {
let newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(e => null);
if (!newsletterInfo) return await conn.reply(m.chat, "*لم يتم العثور على معلومات حول القناة.*", m);
let caption = "*📢 أداة فحص القنوات*\n\n" + processObject(newsletterInfo, "", newsletterInfo?.preview);
pp = newsletterInfo?.preview ? getUrlFromDirectPath(newsletterInfo.preview) : thumb;
await conn.sendMessage(m.chat, {
text: caption,
contextInfo: {
mentionedJid: null,
externalAdReply: {
title: "📢 فاحص القنوات",
body: m.pushName,
thumbnailUrl: m.pp,
sourceUrl: args[0],
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: true
}
}}, { quoted: fkontak });
} catch (e) {
console.log(e);
}}};

handler.help = ["فحص"];
handler.tags = ['أدوات'];
handler.command = /^(فحص|تفقد|تحقق|superinspect|inspect)$/i;
handler.register = true;

export default handler;

// الدوال المساعدة:

function formatDate(n, locale = "ar", includeTime = true) {
if (n > 1e12) n = Math.floor(n / 1000);
else if (n < 1e10) n = Math.floor(n * 1000);
const date = new Date(n);
if (isNaN(date)) return "تاريخ غير صالح";
const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
const formattedDate = date.toLocaleDateString(locale, optionsDate);
if (!includeTime) return formattedDate;
const hours = String(date.getHours()).padStart(2, '0');
const minutes = String(date.getMinutes()).padStart(2, '0');
const seconds = String(date.getSeconds()).padStart(2, '0');
const period = hours < 12 ? 'ص' : 'م';
return `${formattedDate}، ${hours}:${minutes}:${seconds} ${period}`;
}

// باقي الدوال (formatValue, newsletterKey, processObject) لم تتغير كثيرًا ويمكن تعريبها لاحقًا لو أردت.
