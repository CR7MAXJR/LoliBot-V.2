import { db } from '../lib/postgres.js'
import fs from 'fs'

const handler = async (m, { conn }) => {
  const start = Date.now()
  const uptime = process.uptime() * 1000
  const tiempo = clockString(uptime)
  const used = process.memoryUsage()
  const ram = (used.rss / 1024 / 1024).toFixed(2) + ' ميجابايت'
  const usersRes = await db.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE registered = true)::int AS registrados FROM usuarios`)
  const totalUsers = usersRes.rows[0]?.total || 0
  const registrados = usersRes.rows[0]?.registrados || 0
  const chatsRes = await db.query(`SELECT COUNT(*)::int AS total FROM chats`)
  const totalChats = chatsRes.rows[0]?.total || 0
  const ping = Date.now() - start
  const jidBot = conn.user?.id || ''
  const numeroBot = jidBot.split('@')[0]
  const nombreBot = conn.user?.name || 'البوت'
  const isPrincipal = conn === global.conn
  const tipo = isPrincipal ? 'الأساسي' : 'بوت فرعي'
  const ownerBot = global.owner?.[0]?.[0] || 'غير معروف'
  const pesoRes = await db.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS peso`)
  const pesoDB = pesoRes.rows[0]?.peso || 'غير معروف'

  let botsGrupo = 0
  let tagsBotGrupo = []
  if (m.isGroup) {
    try {
      const participantes = (await conn.groupMetadata(m.chat)).participants || []
      const subbots = fs.existsSync('./jadibot') ? fs.readdirSync('./jadibot') : []

      for (const sid of subbots) {
        if (participantes.find(p => p.id === sid)) {
          botsGrupo++
          const num = sid.split('@')[0]
          tagsBotGrupo.push(`• wa.me/${num}`)
        }
      }

      if (participantes.find(p => p.id === jidBot)) {
        botsGrupo++
        tagsBotGrupo.unshift(`• wa.me/${numeroBot}`)
      }
    } catch {
      botsGrupo = 1
    }
  }

  const texto = `🤖 *${nombreBot} (${tipo})*

⏱️ *مدة التشغيل:* ${tiempo}
⚡ *الاستجابة:* ${ping} مللي ثانية
🖥️ *استهلاك الذاكرة:* ${ram}
📦 *قاعدة البيانات:* ${pesoDB}
👤 *إجمالي المستخدمين:* ${totalUsers}
💬 *المحادثات النشطة:* ${totalChats}
${m.isGroup ? `*• عدد البوتات في هذه المجموعة:* ${botsGrupo}\n${tagsBotGrupo.join('\n')}` : ''}
`.trim()

  m.reply(texto)
}

handler.help = ['بنق']
handler.tags = ['عام']
handler.command = /^بنق|ب$/i
handler.owner = false
export default handler

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
