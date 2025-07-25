import { spawn } from 'child_process'

let handler = async (m, { conn, isROwner, text }) => {
  if (!process.send) throw '❌ يجب تشغيل البوت باستخدام: node index.js'
  
  if (conn.user.jid == conn.user.jid) {
    async function loading() {
      var النسبة = ["🔁 10%", "🔁 30%", "🔁 50%", "🔁 80%", "✅ 100%"]
      let { key } = await conn.sendMessage(m.chat, {
        text: `*🔄 جاري إعادة تشغيل البوت...*`
      }, { quoted: m })

      for (let i = 0; i < النسبة.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await conn.sendMessage(m.chat, {
          text: النسبة[i],
          edit: key
        }, { quoted: m })
      }

      await conn.sendMessage(m.chat, {
        text: `✅ تم تنفيذ الأمر بنجاح، جارٍ إعادة التشغيل الآن...\nيرجى الانتظار قليلًا.`,
        edit: key
      }, { quoted: m })

      process.exit(0)
    }

    loading()
  } else throw '🚫 لا تملك صلاحيات تنفيذ هذا الأمر.'
}

handler.help = ['رستت']
handler.tags = ['المالك']
handler.command = ['رستت'] // الأمر الآن هو .رستت فقط
handler.owner = true

export default handler
