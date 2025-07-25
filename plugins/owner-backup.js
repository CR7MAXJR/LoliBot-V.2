import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    const d = new Date()
    const date = d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const jid = conn.user?.id || ''
    const idClean = jid.replace(/:\d+/, '').split('@')[0]
    const isMainBot = jid === global.conn?.user?.id
    const sessionPath = isMainBot ? './BotSession/creds.json' : `./jadibot/${idClean}/creds.json`

    if (!fs.existsSync(sessionPath)) return await m.reply(`❌ لم يتم العثور على ملف *creds.json* في المسار:\n${sessionPath}`)
    
    const creds = fs.readFileSync(sessionPath)

    await m.reply(`_📂 *نسخة احتياطية للجلسة* (${date})_`)
    await conn.sendMessage(m.sender, {
      document: creds,
      mimetype: 'application/json',
      fileName: `creds-${idClean}.json`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ حدث خطأ أثناء إنشاء النسخة الاحتياطية للجلسة.')
  }
}

handler.help = ['نسخه']
handler.tags = ['المالك']
handler.command = /^(نسخه|backup|respaldo|copia)$/i
handler.owner = true

export default handler
