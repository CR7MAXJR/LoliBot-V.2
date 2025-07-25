import fg from 'api-dylux'

let handler = async (m, { conn, text, args }) => {
  if (!text) return m.reply(`✳️ *يرجى إدخال اسم مستخدم تيك توك*`)
  m.react("⌛");

  try {
    const apiUrl = `${info.apis}/tools/tiktokstalk?q=${encodeURIComponent(args[0])}`;
    const apiResponse = await fetch(apiUrl);
    const delius = await apiResponse.json();

    if (!delius || !delius.result || !delius.result.users) return m.react("❌");

    const profile = delius.result.users;
    const stats = delius.result.stats;

    const txt = `👤 *معلومات حساب تيك توك*:
*• اسم المستخدم:* ${profile.username}
*• الاسم:* ${profile.nickname}
*• موثق:* ${profile.verified ? 'نعم' : 'لا'}
*• عدد المتابعين:* ${stats.followerCount.toLocaleString()}
*• عدد المتابَعين:* ${stats.followingCount.toLocaleString()}
*• عدد الإعجابات:* ${stats.heartCount.toLocaleString()}
*• عدد الفيديوهات:* ${stats.videoCount.toLocaleString()}
*• الوصف:* ${profile.signature}
*• الرابط:* 
${profile.url}`;

    await conn.sendFile(m.chat, profile.avatarLarger, 'tt.png', txt, m);
    m.react("✅");

  } catch (e2) {
    try {
      let res = await fg.ttStalk(args[0]);
      let txt = `👤 *معلومات حساب تيك توك*:
*• الاسم:* ${res.name}
*• اسم المستخدم:* ${res.username}
*• المتابعون:* ${res.followers}
*• يتابع:* ${res.following}
*• الوصف:* ${res.desc}
*• الرابط:* https://tiktok.com/${res.username}`;

      await conn.sendFile(m.chat, res.profile, 'tt.png', txt, m);
      m.react("✅");

    } catch (e) {
      await m.react(`❌`);
      m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *يرجى الإبلاغ عن هذا الخطأ للمطور باستخدام الأمر:* #ابلاغ\n\n>>> ${e} <<<`);
      console.log(e);
    }
  }
}

handler.help = ['تيك_ستوك']
handler.tags = ['downloader']
handler.command = /^تيك(_?ستوك|_?معلومات|_?بحث)$/i
handler.register = true
handler.limit = 1

export default handler
