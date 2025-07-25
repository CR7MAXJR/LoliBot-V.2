let handler = async (m, { conn }) => {
  let dados = [
    'https://tinyurl.com/gdd01',
    'https://tinyurl.com/gdd02',
    'https://tinyurl.com/gdd003',
    'https://tinyurl.com/gdd004',
    'https://tinyurl.com/gdd05',
    'https://tinyurl.com/gdd006'
  ]
  
  let url = dados[Math.floor(Math.random() * dados.length)]
  m.react("🎲")

  // إرسال صورة النرد كملصق
  conn.sendFile(
    m.chat,
    url,
    'sticker.webp',
    '',
    m,
    true,
    {
      contextInfo: {
        forwardingScore: 200,
        isForwarded: false,
        externalAdReply: {
          showAdAttribution: false,
          title: m.pushName,
          body: info.wm,
          mediaType: 2,
          sourceUrl: info.wm,
          thumbnail: m.pp
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['نرد']
handler.tags = ['العاب']
handler.command = ['نرد'] // يمكنك إضافة مرادفات مثل ['نرد', 'رمي_النرد'] إن أحببت
handler.register = true

export default handler
