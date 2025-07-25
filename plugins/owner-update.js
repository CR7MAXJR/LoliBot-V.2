import { execSync } from 'child_process';

const handler = async (m, { conn, text }) => {
  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    let messager = stdout.toString();

    if (messager.includes('Already up to date.'))
      messager = `✅ البوت محدث بالفعل إلى آخر إصدار.`;

    if (messager.includes('Updating'))
      messager = `🛠️ *تم التحديث بنجاح:*\n\n` + stdout.toString();

    conn.reply(m.chat, messager, m);
  } catch {
    try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (
              line.includes('.npm/') ||
              line.includes('.cache/') ||
              line.includes('tmp/') ||
              line.includes('BotSession/') ||
              line.includes('npm-debug.log')
            ) {
              return null;
            }
            return '🔸 ' + line.slice(3);
          })
          .filter(Boolean);

        if (conflictedFiles.length > 0) {
          const errorMessage = `⚠️ *تعذر تحديث البوت تلقائيًا بسبب وجود تعديلات محلية تتعارض مع التحديثات الجديدة.*\n\n🧩 *الملفات المتعارضة:*\n\n${conflictedFiles.join('\n')}`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (error) {
      console.error(error);
      await m.reply(`❌ حدث خطأ غير متوقع أثناء محاولة التحديث.\nيرجى التحديث يدويًا من السيرفر.`)
    }
  }
};

handler.help = ['تحديث'];
handler.tags = ['المالك'];
handler.command = /^تحديث$/i;
handler.owner = true;

export default handler;
