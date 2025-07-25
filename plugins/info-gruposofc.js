let handler = async (m, { conn, usedPrefix: _p }) => {
let texto = `*✅ أهلاً بك في المجموعات الرسمية للبوتات:*

1) *${info.nn}*

2) *${info.nn2}*

➤ مجموعة التعاون بين LoliBot و GataBot-MD  
*${info.nn3}*

➤ مجموعة الدعم للرد على استفساراتك/اقتراحاتك وغيرها  
${info.nn6}

➤ لمتابعة التحديثات والتجارب والنسخ الجديدة من LoliBot:  
*${nna2}*

➤ القناة الرسمية للميمز والفيديوهات وآخر أخبار البوتات:  
*${nna}*

┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⇶⃤꙰رابط LoliBot الرسميꦿ⃟⃢  
*${info.nn4}*

ᥫ᭡༶A༶T༶M༶M༶ᰔᩚ  
*${info.nn5}*`.trim();

conn.reply(m.chat, texto, m);
// conn.fakeReply(m.chat, info, '0@s.whatsapp.net', '𝙏𝙝𝙚-𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿', 'status@broadcast')
}

handler.help = ['مجموعات']
handler.tags = ['main']
handler.command = /^روابط|قروبات|مجموعات|رابط-قروب|رابطقروب|linkgc|grupos|grupos-gatabot|gatabot-grupos|gruposdegatabot|group-ofc|gruposgb|grupo-gb|group-gb$/i
handler.register = true;

export default handler;
