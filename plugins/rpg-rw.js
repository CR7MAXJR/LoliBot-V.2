// تم التعريب والتعديل بواسطة: https://github.com/elrebelde21

import fetch from 'node-fetch'

const tempCharacterStore = new Map()

async function getAniListCharacter() {
  const id = Math.floor(Math.random() * 200000)
  const query = `query {
    Character(id: ${id}) {
      name { full }
      image { large }
      gender
      favourites
      media(perPage: 1) {
        nodes {
          title { romaji }
        }
      }
    }
  }`

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const json = await res.json()
  const c = json.data?.Character
  if (!c || !c.image?.large || !c.name?.full) return await getAniListCharacter()

  const rarezas = ['عادي', 'نادر', 'أسطوري', 'خرافي']
  const rareza = rarezas[Math.floor(Math.random() * rarezas.length)]
  const favs = c.favourites || 0
  let price = Math.floor(favs * 0.5)
  if (price < 6500) price = 6500
  if (rareza === 'خرافي' && price < 50000) price = 50000 + Math.floor(Math.random() * 10000)

  return {
    name: c.name.full,
    url: c.image.large,
    tipo: c.gender || 'غير محدد',
    anime: c.media?.nodes[0]?.title?.romaji || 'أنمي',
    rareza,
    price,
    previous_price: null,
    claimed_by: null,
    for_sale: false,
    seller: null,
    votes: 0,
  }
}

async function handler(m, { conn }) {
  if (!m.db) return
  try {
    const res = await m.db.query('SELECT ry_time FROM usuarios WHERE id = $1', [m.sender])
    const lastTime = res.rows[0]?.ry_time || 0
    const now = Date.now()

    if (now - lastTime < 600000) return conn.reply(m.chat, `⏳ انتظر ${msToTime(lastTime + 600000 - now)} قبل استخدام الأمر مجددًا.`, m)

    const character = await getAniListCharacter()
    const esGratis = Math.random() < 0.5

    const { rows: existing } = await m.db.query('SELECT * FROM characters WHERE url = $1', [character.url])
    let claimedCharacter = existing[0]

    if (!claimedCharacter) {
      const { rows } = await m.db.query(`INSERT INTO characters (
        name, url, tipo, anime, rareza, price, previous_price,
        claimed_by, for_sale, seller, votes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`, [
        character.name, character.url, character.tipo, character.anime, character.rareza, character.price,
        character.previous_price, character.claimed_by, character.for_sale, character.seller, character.votes || 0
      ])
      claimedCharacter = rows[0]
    }

    const status = claimedCharacter.for_sale
      ? `💸 الحالة: @${claimedCharacter.claimed_by?.split('@')[0]} يبيع هذه الشخصية.`
      : claimedCharacter.claimed_by
        ? `🔒 الحالة: تم شراؤها من قبل @${claimedCharacter.claimed_by.split('@')[0]}`
        : `🆓 الحالة: متاحة للشراء`

    const priceMessage = !claimedCharacter.claimed_by && esGratis
      ? '🎁 يمكنك الحصول عليها مجانًا!'
      : claimedCharacter.previous_price
        ? `~💰 السعر السابق: ${claimedCharacter.previous_price} نقطة~\n💰 السعر الحالي: ${claimedCharacter.price} نقطة`
        : `💰 السعر: ${claimedCharacter.price} نقطة`

    const sentMessage = await conn.sendFile(m.chat, claimedCharacter.url, 'char.jpg', `💥 الاسم: ${claimedCharacter.name}\n📺 الأنمي: ${claimedCharacter.anime}\n⚧️ النوع: ${claimedCharacter.tipo}\n⭐ الندرة: ${claimedCharacter.rareza}\n${status}\n${priceMessage}\n\n> رد بـ "c" على هذه الرسالة لـ${!claimedCharacter.claimed_by && esGratis ? 'الحصول عليها مجانًا' : 'شرائها'}`, m)

    const messageId = sentMessage.key?.id || sentMessage.id
    tempCharacterStore.set(messageId, { ...claimedCharacter, esGratis, messageId })

    setTimeout(() => tempCharacterStore.delete(m.sender), 5 * 60 * 1000)
    await m.db.query('UPDATE usuarios SET ry_time = $1 WHERE id = $2', [now, m.sender])
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ حدث خطأ أثناء جلب الشخصية. حاول مرة أخرى.', m)
  }
}

handler.before = async (m, { conn }) => {
  const character = m.quoted ? tempCharacterStore.get(m.quoted.key?.id || m.quoted.id) : null
  if (!m.db) return
  if (m.quoted && /^[\/]?c$/i.test(m.originalText) && character && character.messageId === (m.quoted.key?.id || m.quoted.id)) {
    try {
      const { rows } = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [m.sender])
      const user = rows[0]
      const { rows: characters } = await m.db.query('SELECT * FROM characters WHERE url = $1', [character.url])
      const claimedCharacter = characters[0]
      if (!claimedCharacter) return conn.sendMessage(m.chat, { text: '⚠️ لم يتم العثور على الشخصية.' }, { quoted: m })

      if (claimedCharacter.claimed_by) {
        if (!claimedCharacter.for_sale) return conn.sendMessage(m.chat, { text: `⚠️ تم شراء هذه الشخصية مسبقًا من قبل @${claimedCharacter.claimed_by.split('@')[0]}`, contextInfo: { mentionedJid: [claimedCharacter.claimed_by] } }, { quoted: m })
        const seller = claimedCharacter.seller
        if (seller === m.sender) return conn.sendMessage(m.chat, { text: '⚠️ لا يمكنك شراء شخصيتك الخاصة.' }, { quoted: m })
        if (user.exp < character.price) return conn.sendMessage(m.chat, { text: '❌ ليس لديك نقاط كافية لشراء هذه الشخصية.' }, { quoted: m })

        const newExp = user.exp - character.price
        const sellerExp = Math.floor(character.price * 0.9)
        await m.db.query('UPDATE usuarios SET exp = $1 WHERE id = $2', [newExp, m.sender])
        await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [sellerExp, seller])
        await m.db.query('UPDATE characters SET claimed_by = $1, for_sale = false, seller = null WHERE id = $2', [m.sender, claimedCharacter.id])

        await conn.sendMessage(m.chat, { text: `🎉 لقد اشتريت ${character.name} مقابل ${character.price} نقطة!`, image: { url: character.url } }, { quoted: m })

        if (seller) {
          await conn.sendMessage(seller, {
            text: `🎉 تم بيع شخصيتك ${character.name} إلى @${m.sender.split('@')[0]}!\n💰 تم إضافة ${sellerExp} نقطة إلى حسابك.`,
            image: { url: character.url }, contextInfo: { mentionedJid: [m.sender] }
          }, { quoted: m })
        }
      } else {
        const esGratis = character.esGratis
        if (!esGratis && user.exp < character.price) {
          return conn.sendMessage(m.chat, { text: '❌ ليس لديك نقاط كافية لشراء هذه الشخصية.' }, { quoted: m })
        }

        if (!esGratis) {
          await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [character.price, m.sender])
        }

        await m.db.query('UPDATE characters SET claimed_by = $1 WHERE id = $2', [m.sender, claimedCharacter.id])
        const msg = esGratis ? `🎁 لقد حصلت على ${character.name} مجانًا!` : `🎉 لقد اشتريت ${character.name} مقابل ${character.price} نقطة!`
        await conn.sendMessage(m.chat, { text: msg, image: { url: character.url } }, { quoted: m })
      }

      tempCharacterStore.delete(m.quoted?.key?.id || m.quoted?.id)
    } catch (e) {
      console.error(e)
      return conn.sendMessage(m.chat, { text: '⚠️ حدث خطأ أثناء إتمام العملية. حاول مرة أخرى.' }, { quoted: m })
    }
  }
}

handler.help = ['استدعي']
handler.tags = ['gacha']
handler.command = ['استدعي']
handler.register = true

export default handler

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} دقيقة و ${seconds} ثانية`
                        }
