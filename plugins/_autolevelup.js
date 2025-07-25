import { canLevelUp } from '../lib/levelling.js'

const multiplier = 650

export async function before(m, { conn }) {
  const chatres = await m.db.query('SELECT autolevelup FROM group_settings WHERE group_id = $1', [m.chat])
  const chat = chatres.rows[0]
  if (!chat?.autolevelup) return

  const res = await m.db.query('SELECT exp, level, role FROM usuarios WHERE id = $1', [m.sender])
  const user = res.rows[0]

  const before = user.level
  let currentLevel = user.level
  while (canLevelUp(currentLevel, user.exp, multiplier)) {
    currentLevel++
  }

  if (currentLevel > before) {
    const newRole = getRole(currentLevel).name
    await m.db.query('UPDATE usuarios SET level = $1, role = $2 WHERE id = $3', [currentLevel, newRole, m.sender])

    conn.reply(m.chat, [
      `*「 تهانينا 🎉 لقد ارتقيت في المستوى 」*\n\nأحسنت، لقد ارتفعت في المستوى، استمر بهذا الأداء الرائع 👏\n\n*• المستوى:* ${before} ⟿ ${currentLevel}\n*• الرتبة:* ${newRole}\n\n_📌 لعرض نقاط خبرتك في الوقت الحقيقي استخدم الأمر #المستوى_`,
      `@${m.sender.split`@`[0]} واو! لقد وصلت إلى مستوى جديد! 🔥\n*• المستوى:* ${before} ⟿ ${currentLevel}\n\n_📌 لعرض الترتيب استخدم الأمر #الترتيب_`,
      `✨ يا سلام @${m.sender.split`@`[0]} لقد وصلت إلى مستوى جديد 🙌\n\n*• المستوى الجديد:* ${currentLevel}\n*• المستوى السابق:* ${before}\n`
    ].getRandom(), m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: null,
          mediaType: 1,
          description: null,
          title: info.wm,
          body: ' 💫 البوت الخارق في واتساب 🥳 ',
          previewType: 0,
          thumbnail: m.pp,
          sourceUrl: info.md
        }
      }
    })

    let niv = `*${m.pushName || 'مستخدم'}* حصل على مستوى جديد 🥳

*• المستوى السابق:* ${before} 
*• المستوى الحالي:* ${currentLevel}
*• الرتبة:* ${newRole}
*• البوت:* ${info.wm}`

    let nivell = `*${m.pushName || 'مستخدم'} لقد ارتفعت في المستوى 🥳*

> _*• المستوى:* ${before} ⟿ ${currentLevel}_`

    let nivelll = `🥳 ${m.pushName || 'مستخدم'} يا لك من محترف! وصلت إلى مستوى جديد 🥳

*• المستوى:* ${before} ⟿ ${currentLevel}
*• الرتبة:* ${newRole}
*• البوت:* ${info.wm}`

    /* لإرسال إشعار إلى قناة النشرة:
    await global.conn.sendMessage("120363297379773397@newsletter", { text: [niv, nivell, nivelll].getRandom(), contextInfo: {
      externalAdReply: {
        title: "【 🔔 إشعار عام 🔔 】",
        body: 'لقد ارتفعت في المستوى 🥳!',
        thumbnailUrl: m.pp,
        sourceUrl: info.nna,
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: false
      }
    }}, { quoted: null }).catch(err => console.error(err))
    */
  }
}

export function getRole(level) {
  const ranks = ['مبتدئ', 'متدرب', 'مستكشف', 'خبير', 'حديد', 'فضة', 'ذهب', 'أسطورة', 'نجمي', 'ألماسي', 'قمة الفضاء', 'نخبة العالم']
  const subLevels = ['V', 'IV', 'III', 'II', 'I']
  const roles = []

  let lvl = 0
  for (let rank of ranks) {
    for (let sub of subLevels) {
      roles.push({ level: lvl, name: `${rank} ${sub}` })
      lvl++
    }
  }

  return roles.reverse().find(r => level >= r.level) || { level, name: 'مبتدئ V' }
}
