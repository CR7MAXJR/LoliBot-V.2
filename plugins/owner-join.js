import { db, getSubbotConfig } from '../lib/postgres.js'

const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

let handler = async (m, { conn, text, isOwner }) => {
  let quotedText = m.quoted?.text || ""
  let extText = m.quoted?.message?.extendedTextMessage?.text || ""
  let allText = `${quotedText}\n${extText}\n${text}`
  let link = allText.match(linkRegex)?.[0]
  let [_, code] = link ? link.match(linkRegex) : []

  if (!code) throw `🤔 أين رابط المجموعة؟\n\n📌 *كيفية الاستخدام:*\n- أرسل: .انضم <رابط> [مدة زمنية]\n- إن لم تحدد المدة، سيتم الانضمام لمدة 30 دقيقة (للمستخدمين) أو يوم واحد (للمالك).\n\n📝 *أمثلة:*\n- .انضم ${info.nn} (الافتراضي)\n- .انضم ${info.nn2} 60 دقيقة\n- .انضم ${info.nn} 2 يوم\n- .انضم ${info.nn} 1 شهر`

  let waMeMatch = allText.match(/wa\.me\/(\d{8,})/)
  let solicitante = waMeMatch ? waMeMatch[1] : m.sender.split('@')[0]
  const botConfig = await getSubbotConfig(conn.user.id)
  const prestar = botConfig.prestar === undefined ? true : botConfig.prestar
  const timeMatch = text.match(/(\d+)\s*(دقيقة|ساعة|يوم|أيام|شهر)/i)
  let time, unit
  if (!prestar && isOwner) {
    time = timeMatch ? parseInt(timeMatch[1]) : 1
    unit = timeMatch ? timeMatch[2].toLowerCase() : 'يوم'
  } else {
    time = timeMatch ? parseInt(timeMatch[1]) : 30
    unit = timeMatch ? timeMatch[2].toLowerCase() : 'دقيقة'
  }

  let timeInMs
  if (unit.includes('دقيقة')) {
    timeInMs = time * 60 * 1000
  } else if (unit.includes('ساعة')) {
    timeInMs = time * 60 * 60 * 1000
  } else if (unit.includes('يوم') || unit.includes('أيام')) {
    timeInMs = time * 24 * 60 * 60 * 1000
  } else if (unit.includes('شهر')) {
    timeInMs = time * 30 * 24 * 60 * 60 * 1000
  }

  if (!prestar && !isOwner) {
    await m.reply(`📨 تم إرسال رابط مجموعتك إلى مالك البوت.\n\n⏳ *ستتم مراجعة طلبك قريبًا، وقد يتم رفضه للأسباب التالية:*\n1️⃣ البوت مشغول أو ممتلئ.\n2️⃣ تم طرد البوت سابقًا من المجموعة.\n3️⃣ المجموعة لا تتبع قوانين البوت.\n4️⃣ عدد المشاركين أقل من 80.\n5️⃣ الرابط غير صالح أو تم تغييره.\n6️⃣ المالك لا يريد إضافة البوت حاليًا.\n\n🕒 *الرد قد يتأخر، الرجاء التحلي بالصبر.*`)
    let ownerJid = "573226873710@s.whatsapp.net";
    if (ownerJid !== conn.user.jid) {
      await conn.sendMessage(ownerJid, {
        text: `*📬 طلب انضمام بوت إلى مجموعة:*\n\n👤 الرقم: wa.me/${m.sender.split('@')[0]}\n🔗 الرابط: ${link}\n⏱️ المدة: ${time} ${unit}${time > 1 ? 'ات' : ''}`,
        contextInfo: { mentionedJid: [m.sender] }
      })
    }
    return
  }

  if (prestar || isOwner) {
    if (!isOwner) {
      const costPerHour = 100
      const cost = Math.ceil((timeInMs / (60 * 60 * 1000)) * costPerHour)
      let { rows } = await db.query('SELECT limite FROM usuarios WHERE id = $1', [m.sender])
      let limite = rows[0]?.limite ?? 0
      if (limite < cost)
        return m.reply(`❌ ليس لديك ما يكفي من الألماس.\n💎 تحتاج إلى *${cost} ألماسة* لإضافة البوت.`)

      await db.query('UPDATE usuarios SET limite = limite - $1 WHERE id = $2', [cost, m.sender])
      await m.reply(`✅ جاري الانضمام خلال 3 ثوانٍ...\n💎 تم خصم *${cost} ألماسة* من حسابك.`)
    }

    let res
    try {
      res = await conn.groupAcceptInvite(code)
    } catch (e) {
      console.error("خطأ في الانضمام:", e)
      return m.reply("❌ فشل في الانضمام للمجموعة. تأكد من صحة الرابط.")
    }

    await new Promise(r => setTimeout(r, 3000))
    let groupMeta = await conn.groupMetadata(res)
    let groupName = groupMeta.subject || "المجموعة"
    let mes = `👋🏻 مرحبًا بالجميع\n\nأنا *${conn.user.name}*.\nتمت دعوتي بواسطة: *@${solicitante}*\n\n📌 لعرض الأوامر: *#القائمة*\n⏳ سيتم خروجي تلقائيًا بعد:\n${time} ${unit}${time > 1 ? 'ات' : ''}`
    await conn.sendMessage(res, {
      text: mes,
      contextInfo: {
        mentionedJid: [`${solicitante}@s.whatsapp.net`]
      }
    })
    await db.query(
      'INSERT INTO group_settings (group_id, expired) VALUES ($1, $2) ON CONFLICT (group_id) DO UPDATE SET expired = $2',
      [res, Date.now() + timeInMs]
    )
    await m.reply(`✅ انضم البوت إلى المجموعة لمدة *${time} ${unit}${time > 1 ? 'ات' : ''}*`)
  }
}

handler.help = ['انضم <رابط> [مدة]']
handler.tags = ['owner']
handler.command = /^انضم|ادخل|ادخال|ضم|دخول$/i
handler.register = true
export default handler
