import fg from 'api-dylux'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ الرجاء إدخال اسم مستخدم إنستغرام\n\n*مثال:* ${usedPrefix + command} GataDios`)
  
  m.react("⌛")
  
  try {
    const apiUrl = `${info.apis}/tools/igstalk?username=${encodeURIComponent(args[0])}`;
    const apiResponse = await fetch(apiUrl);
    const delius = await apiResponse.json();

    if (!delius || !delius.data) return m.react("❌");

    const profile = delius.data;
    const txt = `👤 *معلومات حساب إنستغرام*:
🔹 *اسم المستخدم*: ${profile.username}
🔹 *الاسم الكامل*: ${profile.full_name}
🔹 *النبذة*: ${profile.biography}
🔹 *موثّق*: ${profile.verified ? 'نعم' : 'لا'}
🔹 *خاص*: ${profile.private ? 'نعم' : 'لا'}
🔹 *عدد المتابعين*: ${profile.followers}
🔹 *يتابع*: ${profile.following}
🔹 *عدد المنشورات*: ${profile.posts}
🔹 *الرابط*: ${profile.url}`;

    await conn.sendFile(m.chat, profile.profile_picture, 'insta_profile.jpg', txt, m);
    m.react("✅");
    
  } catch (e2) {
    try {     
      let res = await fg.igStalk(args[0])
      let te = `👤 *معلومات حساب إنستغرام*:
*• الاسم:* ${res.name}
*• اسم المستخدم:* ${res.username}
*• المتابعين:* ${res.followersH}
*• يتابع:* ${res.followingH}
*• النبذة:* ${res.description}
*• المنشورات:* ${res.postsH}
*• الرابط:* https://instagram.com/${res.username.replace(/^@/, '')}`

      await conn.sendFile(m.chat, res.profilePic, 'igstalk.png', te, m)
      m.react("⌛")     
      
    } catch (e) {
      await m.react(`❌`) 
      m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *يرجى إرسال هذا الخطأ إلى المطور باستخدام الأمر:* #ابلغ\n\n>>> ${e} <<<`)       
      console.log(e)
    }
  }
}

handler.help = ['انستا']
handler.tags = ['tools']
handler.command = ['انستا', 'البحث_انستا', 'معلومات_انستا'] // أوامر عربية بديلة
handler.register = true
handler.limit = 1

export default handler
