import { db } from '../lib/postgres.js';

let handler = async (m, { conn, text, participants, metadata, args, command }) => {

if (command == 'منشن') {
    let usarLid = participants.some(p => p.id?.endsWith?.('@lid'))
    let mensaje = args.join` `
    let oi = `*📢 الرسالة:* ${mensaje}`
    let teks = `*⺀ تفعيل المجموعة 🗣️⺀*\n\n❏ ${oi} \n\n❏ *قائمة المنشن:*\n`
    let menciones = []
    let desconocidos = []

    for (let mem of participants) {
        let numero = null

        if (usarLid && mem.id.endsWith('@lid')) {
            const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id])
            numero = res.rows[0]?.num || null
        } else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
            numero = mem.id.split('@')[0]
        }

        if (numero) {
            teks += `➥ @${numero}\n`
            menciones.push(mem.id)
        } else {
            desconocidos.push({ id: mem.id, fake: `@مستخدم` })
        }
    }

    for (let i = 0; i < desconocidos.length; i++) {
        teks += `➥ ${desconocidos[i].fake}\n`
    }

    await conn.sendMessage(m.chat, { text: teks, mentions: menciones })
}

if (command == 'عد_الرسائل') {
    let usarLid = participants.some(p => p.id?.endsWith?.('@lid'))
    const result = await db.query(`SELECT user_id, message_count
        FROM messages
        WHERE group_id = $1`, [m.chat])

    let memberData = participants.map(mem => {
        const userId = mem.id;
        const userData = result.rows.find(row => row.user_id === userId) || { message_count: 0 };
        return { id: userId, messages: userData.message_count };
    })

    memberData.sort((a, b) => b.messages - a.messages)
    let activeCount = memberData.filter(mem => mem.messages > 0).length
    let inactiveCount = memberData.filter(mem => mem.messages === 0).length

    let teks = `*📊 إحصائية نشاط المجموعة 📊*\n\n`
    teks += `□ اسم المجموعة: ${metadata.subject || 'بدون اسم'}\n`
    teks += `□ عدد الأعضاء: ${participants.length}\n`
    teks += `□ الأعضاء النشطين: ${activeCount}\n`
    teks += `□ الأعضاء غير النشطين: ${inactiveCount}\n\n`
    teks += `*□ تفاصيل الأعضاء:*\n`

    for (let mem of memberData) {
        let numero = null
        if (usarLid && mem.id.endsWith('@lid')) {
            const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id])
            numero = res.rows[0]?.num || null
        } else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
            numero = mem.id.split('@')[0]
        }
        teks += `➥ @${numero || 'مستخدم'} - عدد الرسائل: ${mem.messages}\n`
    }

    await conn.sendMessage(m.chat, { text: teks, mentions: memberData.filter(mem => /^\d+@s\.whatsapp\.net$/.test(mem.id) || mem.id.endsWith('@lid')).map(mem => mem.id) }, { quoted: m });
}}

handler.help = ['منشن <رسالة>', 'عد_الرسائل']
handler.tags = ['group']
handler.command = /^(منشن|عد_الرسائل)$/i
handler.admin = true
handler.group = true
//handler.botAdmin = true
export default handler
