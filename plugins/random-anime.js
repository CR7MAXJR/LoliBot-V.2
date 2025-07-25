import fetch from 'node-fetch'
import axios from 'axios'
import hispamemes from 'hispamemes'
import { db } from '../lib/postgres.js'

const contenido = {
  وايفو: { label: '*💖 وايفو جميلة 💖*', api: 'waifu', nsfwApi: 'waifu', type: 'api', aliases: ['waifu'] },
  نيكو: { label: '🐱 نيكو (قطة)', api: 'neko', nsfwApi: 'neko', type: 'api', aliases: ['neko', 'gatito', 'nyan'] },
  شينوبو: { label: '🍡 شينوبو', api: 'shinobu', type: 'api', aliases: ['shinobu'] },
  ميجومين: { label: '💥 ميجومين', api: 'megumin', type: 'api', aliases: ['meg', 'megumin'] },
  شرير: { label: '😈 مضايقة', api: 'bully', type: 'api', aliases: ['bully'] },
  حضن: { label: '🥰 حضن', api: 'cuddle', type: 'api', aliases: ['cuddle'] },
  بكاء: { label: '😭 بكاء', api: 'cry', type: 'api', aliases: ['cry'] },
  بونك: { label: '🔨 ضربة بونك', api: 'bonk', type: 'api', aliases: ['bonk'] },
  غمزة: { label: '😉 غمزة', api: 'wink', type: 'api', aliases: ['wink'] },
  يد: { label: '🤝 مسك اليد', api: 'handhold', type: 'api', aliases: ['handhold'] },
  لقمة: { label: '🍪 لقمة', api: 'nom', type: 'api', aliases: ['nom'] },
  عناق: { label: '💞 عناق', api: 'glomp', type: 'api', aliases: ['glomp'] },
  فرح: { label: '😁 فرح', api: 'happy', type: 'api', aliases: ['happy'] },
  نكز: { label: '👉 نكز', api: 'poke', type: 'api', aliases: ['poke'] },
  رقص: { label: '💃 رقص', api: 'dance', type: 'api', aliases: ['dance'] },
  ميم: { label: '🤣 ميم عشوائي', isMeme: true, aliases: ['meme', 'memes', 'meme2'] },
  لولي: { label: '*أنا لوليتك اوووووه 😍*', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/loli.json', aliases: ['kawaii', 'loli'] },
  عيد: { label: '🎄 صور عيد الميلاد', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/navidad.json', aliases: ['navidad'] },
  ميسي: { label: '*🇦🇷 ميسي الأسطورة*', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/messi.json', aliases: ['messi'] },
  رونالدو: { label: '_*سيييييي*_', type: 'json', url: 'https://raw.githubusercontent.com/elrebelde21/The-LoliBot-MD2/main/src/randow/CristianoRonaldo.json', aliases: ['ronaldo', 'cristiano'] }
}

const aliasMap = {}
for (const [key, item] of Object.entries(contenido)) {
  aliasMap[key.toLowerCase()] = item
  for (const alias of (item.aliases || [])) {
    aliasMap[alias.toLowerCase()] = item
  }
}

let handler = async (m, { conn, command }) => {
  try {
    const item = aliasMap[command.toLowerCase()]
    if (!item) return m.reply('❌ الأمر غير معروف.')

    if (item.isMeme) {
      const url = await hispamemes.meme()
      await conn.sendFile(m.chat, url, 'meme.jpg', `😂🤣`, m)
      return
    }

    if (item.type === 'json') {
      const res = await axios.get(item.url)
      const imgs = res.data
      const img = imgs[Math.floor(Math.random() * imgs.length)]
      await conn.sendMessage(m.chat, { image: { url: img }, caption: item.label }, { quoted: m })
      return
    }

    if (item.type === 'api') {
      let apiPath = `https://api.waifu.pics/sfw/${item.api}`
      try {
        const { rows } = await db.query(`SELECT modohorny FROM group_settings WHERE group_id = $1`, [m.chat])
        const isNSFW = rows[0]?.modohorny === true
        if (isNSFW && item.nsfwApi) {
          apiPath = `https://api.waifu.pics/nsfw/${item.nsfwApi}`
        }
      } catch (err) {
        console.error('❌ خطأ أثناء التحقق من NSFW:', err)
      }
      const res = await fetch(apiPath)
      const { url } = await res.json()
      await conn.sendFile(m.chat, url, 'anime.jpg', item.label, m)
      return
    }

    if (item.type === 'video') {
      const vid = item.vids[Math.floor(Math.random() * item.vids.length)]
      await conn.sendFile(m.chat, vid, 'video.mp4', item.label, m)
      return
    }

    if (item.type === 'static') {
      const img = item.imgs[Math.floor(Math.random() * item.imgs.length)]
      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: item.label
      }, { quoted: m })
      return
    }

  } catch (e) {
    console.error('[❌ خطأ في إرسال الصورة]', e)
    m.reply('❌ حدث خطأ أثناء إرسال الصورة.')
  }
}

handler.command = new RegExp(`^(${Object.keys(aliasMap).join('|')})$`, 'i')
handler.help = Object.keys(aliasMap)
handler.tags = ['عشوائي']
handler.register = true

export default handler
