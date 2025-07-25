const handler = async (m) => {
  const uptime = process.uptime() * 1000 // بالمللي ثانية
  const tiempo = صيغة_الوقت(uptime)
  m.reply(`⏱️ *مدة تشغيل البوت:* ${tiempo}`)
}

handler.help = ['وقت']
handler.tags = ['النظام']
handler.command = /^وقت$/i
export default handler

function صيغة_الوقت(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
