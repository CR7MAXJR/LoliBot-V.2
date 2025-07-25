import util from 'util';
import path from 'path';
import fetch from 'node-fetch';

let toM = a => '@' + a.split('@')[0];
let handler = async (m, { conn, metadata, command, text, participants, usedPrefix }) => {
  let fkontak = { 
    "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "مرحبًا" }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:جوال\nEND:VCARD`
      }
    }, 
    "participant": "0@s.whatsapp.net" 
  };

  try {
    let user = a => '@' + a.split('@')[0];
    let ps = metadata.participants.map(v => v.id);
    let a = ps.getRandom();
    let b = ps.getRandom();
    let c = ps.getRandom();
    let d = ps.getRandom();
    let e = ps.getRandom();
    let f = ps.getRandom();
    let g = ps.getRandom();
    let h = ps.getRandom();
    let i = ps.getRandom();
    let j = ps.getRandom();

    // أمر الصداقة
    if (command == 'صداقة' || command == 'صديق-عشوائي') {
      m.reply(`*🌟 دعونا نصنع صداقات جديدة! 🌟*\n\n*يا ${toM(a)}، راسل ${toM(b)} على الخاص واستمتعوا باللعب معًا! 😄*\n\n*أجمل الصداقات تبدأ بلعبة! 😉*`, null, {
        mentions: [a, b]
      });
    }

    // أمر المزاح (بديل لـ follar/violar)
    if (command == 'مزاح' || command == 'مغازلة') {
      if (!text) return m.reply(`*أدخل اسم أو @ للشخص الذي تريد مزاحه!*`);
      let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
      conn.reply(m.chat, `😜 *يا ${text}، لقد تمت مغازلتك بنجاح!* 😎\n\n*${toM(user)} تلقى جرعة من المزاح الخفيف، ههه! 😄*`, m, { mentions: [user] });
    }

    // أمر تشكيل أزواج
    if (command == 'تشكيل-زوج' || command == 'تشكيل-أزواج') {
      m.reply(`*${toM(a)}، حان الوقت لتتزوج 💍 من ${toM(b)}، يا لها من ثنائي رائع! 😍*`, null, {
        mentions: [a, b]
      });
    }

    // أمر الشخصية
    if (command == 'شخصية') {
      if (!text) return conn.reply(m.chat, 'أدخل اسم الشخص؟', m);
      let personalidad = `┏━━°❀❬ *تحليل الشخصية* ❭❀°━━┓
      *┃*  
      *┃• الاسم*: ${text}  
      *┃• الأخلاق الحسنة*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• الأخلاق السيئة*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• نوع الشخصية*: ${pickRandom(['طيب القلب','متعجرف','بخيل','كريم','متواضع','خجول','جبان','فضولي','حساس','غير ثنائي 😜','غبي'])}  
      *┃• دائمًا*: ${pickRandom(['ثقيل','مزاجه سيء','مشغول','مزعج','نمام','يضيع وقت','يتسوق','يشاهد أنمي','يدردش على واتساب لأنه أعزب','ممدد وكسول','مغازلجي','على هاتفه'])}  
      *┃• الذكاء*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• التأخر*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• الشجاعة*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• الخوف*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98.3%','99.7%','99.9%','1%','2.9%','0%','0.4%'])}  
      *┃• الشهرة*: ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','1%','2.9%','0%','0.4%'])}  
      *┃• الجنس*: ${pickRandom(['رجل','امرأة','مثلي','ثنائي','بانسيكشوال','نسوي','مغاير','رجل ألفا','امرأة قوية','فتاة رجولية','بالوسيكشوال','بلاي ستيشن-سيكشوال','السيد مانويل','بولو-سيكشوال'])}  
      ┗━━━━━━━━━━━━━━━━`;
      conn.reply(m.chat, personalidad, m, { mentions: conn.parseMention(personalidad) });
    }

    // أمر الحب
    if (command == 'حب') {
      if (!text) return m.reply('⚠️ اكتب اسم شخصين لقياس الحب بينهما');
      let [text1, ...text2] = text.split(' ');
      text2 = (text2 || []).join(' ');
      if (!text2) throw '⚠️ ينقص اسم الشخص الثاني';
      let love = `❤️ *${text1}* فرصتك في الوقوع في حب *${text2}* هي *${Math.floor(Math.random() * 100)}%* 💑`.trim();
      m.reply(love, null, { mentions: conn.parseMention(love) });
    }

    // أمر محاكاة الاختراق
    if (command == 'محاكاة-اختراق' || command == 'اختراق-مزيف' || command == 'اختراق' || command == 'اخترقني') {
      let who = m.isGroup ? m.mentionedJid[0] : m.chat;
      let start = `*😱 جاري محاكاة الاختراق! 😱*`;
      let ala = `😨`;
      let boost = `*${pickRandom(['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'])}%*`;
      let boost2 = `*${pickRandom(['21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40'])}%*`;
      let boost3 = `*${pickRandom(['41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'])}%*`;
      let boost4 = `*${pickRandom(['61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80'])}%*`;
      let boost5 = `*${pickRandom(['81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'])}%*`;

      const { key } = await conn.sendMessage(m.chat, { text: start, mentions: conn.parseMention(text) }, { quoted: m });
      await delay(1000 * 1);
      await conn.sendMessage(m.chat, { text: boost2, edit: key });
      await delay(1000 * 1);
      await conn.sendMessage(m.chat, { text: boost3, edit: key });
      await delay(1000 * 1);
      await conn.sendMessage(m.chat, { text: boost4, edit: key });
      await delay(1000 * 1);
      await conn.sendMessage(m.chat, { text: boost5, edit: key });

      let old = performance.now();
      let neww = performance.now();
      let speed = neww - old;
      let doxeo = `✅ *تمت محاكاة الاختراق بنجاح (مزحة)!* 🤣
      \n*الوقت*: ${speed} ثانية!
      \n*النتائج*:
      الاسم: ${text}
      العنوان الوهمي: شارع المزح 123
      رقم الهاتف: 123-456-789
      البريد الإلكتروني: ${text}@مزحة.com
      ملاحظة: هذه مجرد مزحة! 😜`;
      await conn.sendMessage(m.chat, { text: doxeo, edit: key });
    }

    // أمر المتميز
    if (command == 'متميز') {
      let vn = 'https://qu.ax/HfeP.mp3';
      let who = m.isGroup ? (m.mentionedJid[0] ? m.mentionedJid[0] : m.sender) : m.sender;
      let member = participants.map(u => u.id);
      let random = Math.floor(Math.random() * 100);
      let metmiz = random;
      if (metmiz < 20) { metmiz = 'أنت مميز جدًا! 😎'; }
      else if (metmiz >= 21 && metmiz <= 30) { metmiz = 'نوعًا ما مميز 🤔'; }
      else if (metmiz >= 31 && metmiz <= 40) { metmiz = 'هل أنت مميز حقًا؟ 😏'; }
      else if (metmiz >= 41 && metmiz <= 50) { metmiz = 'مميز بنسبة لا بأس بها! 🧐'; }
      else { metmiz = 'أنت نجم المجموعة! 🌟'; }
      let jawab = `@${who.split("@")[0]} هو ${random}% مميز\n\n${metmiz}`;
      const avatar = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
      const imageRes = await fetch(`https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`);
      const buffer = await imageRes.buffer();

      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: jawab,
        contextInfo: {
          mentionedJid: [who],
          forwardingScore: 9999999,
          isForwarded: false
        }
      }, { quoted: m, ephemeralExpiration: 24 * 60 * 1000 });

      await conn.sendFile(m.chat, vn, 'metmiz.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      });
    }

    // أمر نسبة التميز
    if (command == 'نسبة-تميز') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *مميز* 🏆`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة الأناقة
    if (command == 'أناقة') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *أنيق* 👗`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة الكسل
    if (command == 'كسل' || command == 'كسول') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *كسول* 😴`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة النشاط
    if (command == 'نشاط' || command == 'نشيط') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *نشيط* 🏃‍♂️`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة المهارة
    if (command == 'مهارة') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *ماهر* 🎯`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة الذكاء
    if (command == 'ذكاء') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *ذكي* 🧠`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر نسبة الجاذبية
    if (command == 'جاذبية') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص المطلوب');
      let juego = `*${text.toUpperCase()}* هو *${Math.floor(Math.random() * 100)}%* *جذاب* 😎`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر الهدية
    if (command == 'هدية' || command == 'إهداء') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص الذي تريد إهداءه');
      let juego = `*${toM(a)}* يهدي هدية 🎁 لـ *${text}*! يا لها من مفاجأة رائعة! 😍`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر الإرسال
    if (command == 'إرسال') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص الذي تريد إرسال شيء له');
      let juego = `*${toM(a)}* يرسل رسالة 📬 لـ *${text}*! ما الذي يخبئه؟ 😄`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر التحدي
    if (command == 'تحدي' || command == 'رتّب') {
      if (!text) return m.reply('🤔 ضع علامة @ للشخص الذي تريد تحديه');
      let juego = `*${toM(a)}* يتحدى *${text}*! هل ستقبل التحدي؟ 💪`.trim();
      await conn.reply(m.chat, juego, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
    }

    // أمر السؤال
    if (command == 'سؤال' || command == 'أسئلة') {
      if (!text) return m.reply('🤔 اكتب سؤالك!');
      let pregunta = `❓ *سؤال من ${toM(a)}*: ${text}\n\nمن يجرؤ على الإجابة؟ 😏`;
      m.reply(pregunta, null, { mentions: [a] });
    }

    // أمر هل (بديل لـ apakah)
    if (command == 'هل') {
      if (!text) return m.reply('🤔 اكتب سؤالك يبدأ بـ "هل"!');
      let apakah = `❔ *هل*: ${text}\n\nالجواب: *${pickRandom(['نعم','لا','ربما','مستحيل','من الممكن'])}*! 😄`;
      m.reply(apakah, null, { mentions: [a] });
    }

    // أمر توب عام
    if (command == 'توب') {
      if (!text) return m.reply(`ما النص؟ 🤔\n📍 مثال: ${usedPrefix}توب أشخاص`);
      let x = pickRandom(['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚']);
      let k = Math.floor(Math.random() * 70);
      let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`;
      let top = `${x} توب 10 ${text} ${x}

1. ${user(a)}
2. ${user(b)}
3. ${user(c)}
4. ${user(d)}
5. ${user(e)}
6. ${user(f)}
7. ${user(g)}
8. ${user(h)}
9. ${user(i)}
10. ${user(j)}`;
      m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j] });
      conn.sendFile(m.chat, vn, 'sound.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      });
    }

    // أمر توب المتميزين
    if (command == 'توب-متميزين') {
      let vn = 'https://qu.ax/HfeP.mp3';
      let top = `🌟 توب 10 متميزين في المجموعة 🌟

1.- 🏆 ${user(a)} 🏆
2.- 🥈 ${user(b)} 🥈
3.- 🥉 ${user(c)} 🥉
4.- 🏆 ${user(d)} 🏆
5.- 🥈 ${user(e)} 🥈
6.- 🥉 ${user(f)} 🥉
7.- 🏆 ${user(g)} 🏆
8.- 🥈 ${user(h)} 🥈
9.- 🥉 ${user(i)} 🥉
10.- 🏆 ${user(j)} 🏆`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
      conn.sendFile(m.chat, vn, 'sound.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      });
    }

    // أمر توب عشاق الأنمي
    if (command == 'توب-أنمي') {
      let vn = 'https://qu.ax/ZgFZ.mp3';
      let top = `🌸 توب 10 عشاق الأنمي في المجموعة 🌸

1.- 💮 ${user(a)} 💮
2.- 🌷 ${user(b)} 🌷
3.- 💮 ${user(c)} 💮
4.- 🌷 ${user(d)} 🌷
5.- 💮 ${user(e)} 💮
6.- 🌷 ${user(f)} 🌷
7.- 💮 ${user(g)} 💮
8.- 🌷 ${user(h)} 🌷
9.- 💮 ${user(i)} 💮
10.- 🌷 ${user(j)} 🌷`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
      conn.sendFile(m.chat, vn, 'otaku.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      });
    }

    // أمر توب الأصدقاء
    if (command == 'توب-أصدقاء' || command == 'توب-صديق') {
      let top = `💎 توب 10 أفضل الأصدقاء في المجموعة 👑

1.- 💎 ${user(a)} 💎
2.- 👑 ${user(b)} 👑
3.- 💎 ${user(c)} 💎
4.- 👑 ${user(d)} 👑
5.- 💎 ${user(e)} 💎
6.- 👑 ${user(f)} 👑
7.- 💎 ${user(g)} 💎
8.- 👑 ${user(h)} 👑
9.- 💎 ${user(i)} 💎
10.- 👑 ${user(j)} 👑`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب المرحين
    if (command == 'toplagrara' || command == 'topgrasa') {
      let top = `😂 توب 10 المرحين في المجموعة 😂

1.- 😜 ${user(a)} 😜
2.- 😄 ${user(b)} 😄
3.- 😆 ${user(c)} 😆
4.- 😝 ${user(d)} 😝
5.- 😛 ${user(e)} 😛
6.- 😸 ${user(f)} 😸
7.- 😹 ${user(g)} 😹
8.- 😺 ${user(h)} 😺
9.- 😻 ${user(i)} 😻
10.- 😽 ${user(j)} 😽`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب الأنيقين
    if (command == 'توب-أنيقين' || command == 'توب-انيق') {
      let top = `👊 توب 10 الأنيقين في المجموعة 👖

1.- 🤑 ${user(a)} 🤑
2.- 🤙 ${user(b)} 🤙
3.- 😎 ${user(c)} 😎
4.- 👌 ${user(d)} 👌
5.- 🧐 ${user(e)} 🧐
6.- 😃 ${user(f)} 😃
7.- 😋 ${user(g)} 😋
8.- 🤜 ${user(h)} 🤜
9.- 💪 ${user(i)} 💪
10.- 😉 ${user(j)} 😉`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب المبدعين
    if (command == 'توب-مبدعين' || command == 'توب-مبدع') {
      let top = `😱 توب 10 المبدعين في المجموعة 😱

1.- 😈 ${user(a)} 😈
2.- 🤙 ${user(b)} 🤙
3.- 🥶 ${user(c)} 🥶
4.- 🤑 ${user(d)} 🤑
5.- 🥵 ${user(e)} 🥵
6.- 🤝 ${user(f)} 🤝
7.- 😟 ${user(g)} 😟
8.- 😨 ${user(h)} 😨
9.- 😇 ${user(i)} 😇
10.- 🤠 ${user(j)} 🤠`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب الكسالى
    if (command == 'توب-كسالى') {
      let top = `😴 توب 10 الكسالى في المجموعة 💤

1.- 😴 ${user(a)} 😴
2.- 😴 ${user(b)} 😴
3.- 😴 ${user(c)} 😴
4.- 😴 ${user(d)} 😴
5.- 😴 ${user(e)} 😴
6.- 😴 ${user(f)} 😴
7.- 😴 ${user(g)} 😴
8.- 😴 ${user(h)} 😴
9.- 😴 ${user(i)} 😴
10.- 😴 ${user(j)} 😴`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب الجميلين
    if (command == 'توب-جميلين' || command == 'توب-جمليل') {
      let top = `😳 توب 10 الجميلين والأنيقين في المجموعة 😳

1.- ✨ ${user(a)} ✨
2.- ✨ ${user(b)} ✨
3.- ✨ ${user(c)} ✨
4.- ✨ ${user(d)} ✨
5.- ✨ ${user(e)} ✨
6.- ✨ ${user(f)} ✨
7.- ✨ ${user(g)} ✨
8.- ✨ ${user(h)} ✨
9.- ✨ ${user(i)} ✨
10.- ✨ ${user(j)} ✨`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب المشهورين
    if (command == 'توب-مشاهير' || command == 'توب-مشاهير') {
      let top = `🌟 توب 10 المشهورين في المجموعة 🌟

1.- 🛫 ${user(a)} 🛫
2.- 🥂 ${user(b)} 🥂
3.- 🤩 ${user(c)} 🤩
4.- 🛫 ${user(d)} 🛫
5.- 🥂 ${user(e)} 🥂
6.- 🤩 ${user(f)} 🤩
7.- 🛫 ${user(g)} 🛫
8.- 🥂 ${user(h)} 🥂
9.- 🤩 ${user(i)} 🤩
10.- 🛫 ${user(j)} 🛫`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر توب الأزواج
    if (command == 'توب-أزواج' || command == 'توب-5أزواج') {
      let top = `😍 توب 5 أزواج رائعين في المجموعة 😍

1.- ${user(a)} 💘 ${user(b)}
          *يا لها من ثنائي رائع! 💖، هل أنتم مدعووني لحفل زفافهم؟ 🛐*

      2.- ${user(c)} 💘 ${user(d)}
      *🌹 يستحقون أجمل الأشياء في العالم! 💞*

      3.- ${user(e)} 💘 ${user(f)}
      *عاشقان جدًا! 😍، متى سنرى العائلة؟ 🥰*

      4.- ${user(g)} 💘 ${user(h)}
      *💗 هما ثنائي العام بلا منازع! 💗*

      5.- ${user(i)} 💘 ${user(j)}
      *رائع! 💝، هل هم في شهر عسل؟ 🥵*`;
      m.reply(top, null, { mentions: conn.parseMention(top) });
    }

    // أمر الروليت (بديل لـ ruleta/suerte)
    if (command == 'روليت' || command == 'حظ') {
      let suerte = `🎰 *لعبة الحظ!* 🎰\n\n*${toM(a))}* يدور الروليت... ويحصل على: *${pickRandom(['جائزة كبيرة! 🎉','لا شيء، حاول مرة أخرى! 😅','مفاجأة صغيرة! 😜','خسارة، لكن المرح يستمر! 😎'])}*`;
      m.reply(suerte, null, { mentions: [a] });
    }

  } catch (e) {
    console.log(e);
  }
};

handler.help = [
  'حب', 'صداقة', 'صديق-عشوائي', 'مزاح', 'مغازلة', 'تشكيل-زوج', 'تشكيل-أزواج', 'شخصية', 
  'محاكاة-اختراق', 'اختراق-مزيف', 'اختراق', 'اخترقني', 'متميز', 'نسبة-تميز', 'أناقة', 
  'كسل', 'كسول', 'نشاط', 'نشيط', 'مهارة', 'ذكاء', 'جاذبية', 'هدية', 'إهداء', 'إرسال', 
  'تحدي', 'رتط', 'سؤال', 'أسئلة', 'هل', 'توب', 'توب-متميزين', 'توب-أنمي', 'توب-أصدقاء', 
  'توب-مرحين', 'توب-أنيقين', 'توب-مبدعين', 'توب-كسالى', 'توب-جميلين', 'توب-مشهورين', 
  'توب-أزواج', 'توب-5أزواج', 'روليت', 'حظ'
];
handler.tags = ['لعبة'];
handler.command = /^(حب|صداقة|صديق-عشوائي|مزاح|مغازلة|تشكيل-زوج|تشكيل-أزواج|شخصية|محاكاة-اختراق|اختراق-مزيف|اختراق|اخترقني|متميز|نسبة-تميز|أناقة|كسل|كسول|نشاط|نشيط|مهارة|ذكاء|جاذبية|هدية|إهداء|إرسال|تحدي|رتط|سؤال|أسئلة|هل|توب|توب-متميزين|توب-أنمي|توب-أصدقاء|توب-مرحين|توب-أنيقين|توب-مبدعين|توب-كسالى|توب-جميلين|توب-مشهورين|توب-أزواج|توب-5أزواج|روليت|حظ)$/i;
handler.register = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return hours + " ساعة " + minutes + " دقيقة";
    }
