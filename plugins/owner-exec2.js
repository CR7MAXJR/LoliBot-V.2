import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return; // هذا الأمر فقط للمالك الحقيقي
  if (conn.user.jid !== conn.user.jid) return;

  m.react("💻")

  let الأمر = m.originalText?.replace(/^تشغيل\s?/, '').trim()
  let النتيجة;
  try {
    النتيجة = await exec(الأمر)
  } catch (خطأ) {
    النتيجة = خطأ
  } finally {
    let { stdout, stderr } = النتيجة
    if (stdout?.trim()) m.reply(stdout)
    if (stderr?.trim()) m.reply(stderr)
  }
}

handler.help = ['تشغيل']
handler.tags = ['المالك']
handler.command = /^تشغيل\s?/i // الأمر يكون: تشغيل <كود شل>
export default handler
