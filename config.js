import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

// المالك
global.owner = [
  ['994407726748']
]

// معلومات البوت
globalThis.info = {
  wm: "لوليبوت - LoliBot-MD", // العلامة المائية
  vs: "الإصدار 2.0.0 (تجريبي)", // إصدار البوت
  packname: "مُلصقات لوليبوت ❤️‍🔥", // اسم حزمة الملصقات
  author: "👑 المالك: @elrebelde21\n🎀 المالكة: @itschinita_official", // أسماء المالكين

  // روابط API
  apis: "https://delirius-apiofc.vercel.app",
  apikey: "GataDios",
  fgmods: { url: 'https://api.fgmods.xyz/api', key: 'elrebelde21' },
  neoxr: { url: 'https://api.neoxr.eu/api', key: 'GataDios' },

  // صور
  img2: "https://telegra.ph/file/39fb047cdf23c790e0146.jpg",
  img4: fs.readFileSync('./media/Menu2.jpg')
}

//----------------------------------------------------

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("تم تحديث 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
