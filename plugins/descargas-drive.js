import fetch from 'node-fetch';

const userCaptions = new Map();
const userRequests = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ يرجى إدخال رابط Google Drive\n🔹 مثال: ${usedPrefix + command} https://drive.google.com/file/d/xxxxxxxx/view?usp=drivesdk`);

  if (userRequests[m.sender]) {
    conn.reply(m.chat, `⏳ *مرحبًا @${m.sender.split('@')[0]}، انتظر...* هناك طلب قيد المعالجة بالفعل. يرجى الانتظار حتى ينتهي قبل إرسال طلب آخر.`, userCaptions.get(m.sender) || m);
    return;
  }

  userRequests[m.sender] = true;
  m.react("📥");

  try {
    const waitMessageSent = conn.reply(
      m.chat,
      `*⌛ جاري التحميل...*\n*⏳ إذا لم يصلك الملف، قد يكون حجمه كبيرًا جدًا.*`,
      m
    );
    userCaptions.set(m.sender, waitMessageSent);

    const downloadAttempts = [
      async () => {
        const api = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${args[0]}`);
        const data = await api.json();
        return {
          url: data.data.download,
          filename: data.data.name,
        };
      },
      async () => {
        const api = await fetch(`https://apis.davidcyriltech.my.id/gdrive?url=${args[0]}`);
        const data = await api.json();
        return {
          url: data.download_link,
          filename: data.name,
        };
      },
    ];

    let fileData = null;

    for (const attempt of downloadAttempts) {
      try {
        fileData = await attempt();
        if (fileData) break;
      } catch (err) {
        console.error(`خطأ أثناء المحاولة: ${err.message}`);
        continue;
      }
    }

    if (!fileData) throw new Error('تعذر تحميل الملف من أي واجهة برمجية.');

    const { url, filename } = fileData;
    const mimetype = getMimetype(filename);

    await conn.sendMessage(
      m.chat,
      {
        document: { url: url },
        mimetype: mimetype,
        fileName: filename,
        caption: null,
      },
      { quoted: m }
    );

    await m.react("✅");
  } catch (e) {
    m.react("❌");
    m.reply(`\`\`\`⚠️ حدث خطأ ⚠️\`\`\`\n\n> *يرجى إرسال هذا الخطأ للمطور باستخدام الأمر:* #report\n\n>>> ${e} <<<`);
    console.log(e);
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['تحميل <الرابط>'];
handler.tags = ['التحميل'];
handler.command = /^(تحميل|جوجل|رابط|جدراب)$/i;
handler.register = true;
handler.limit = 3;

export default handler;

const getMimetype = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'mp4': 'video/mp4',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'zip': 'application/zip',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'mp3': 'audio/mpeg',
    'apk': 'application/vnd.android.package-archive',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'ogg': 'audio/ogg',
    'wav': 'audio/wav',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};
