const handler = async (m, { conn, args, command, usedPrefix }) => {
  const cooldown = 30_000;
  const now = Date.now();
  const res = await m.db.query('SELECT exp, wait FROM usuarios WHERE id = $1', [m.sender]);
  const user = res.rows[0];
  const lastWait = Number(user?.wait) || 0;
  const remaining = lastWait + cooldown - now;

  if (remaining > 0) {
    return conn.fakeReply(
      m.chat,
      `🕓 *مهلًا يا صديقي، انتظر ${msToTime(remaining)} قبل استخدام الأمر مرة أخرى.*`,
      m.sender,
      '🔕 لا تُكثر من الاستخدام.',
      'status@broadcast'
    );
  }

  if (args.length < 2) {
    return conn.reply(
      m.chat,
      `⚠️ *الصيغة غير صحيحة.*\n✅ الاستعمال الصحيح:\n${usedPrefix + command} <اللون> <الكمية>\n\n🧪 مثال:\n${usedPrefix + command} اسود 100`,
      m
    );
  }

  const inputColor = args[0].toLowerCase();
  const colorMap = { 'احمر': 'red', 'اسود': 'black', 'اخضر': 'green' };
  const color = colorMap[inputColor] || inputColor;
  const betAmount = parseInt(args[1]);

  if (!['red', 'black', 'green'].includes(color)) {
    return conn.reply(m.chat, '🎯 *اللون غير صالح. استخدم:* "احمر" أو "اسود" أو "اخضر".', m);
  }

  if (isNaN(betAmount) || betAmount <= 0) {
    return conn.reply(m.chat, '❌ *يرجى إدخال كمية صحيحة (رقم موجب).*', m);
  }

  if (user.exp < betAmount) {
    return conn.reply(m.chat, `❌ *لا تملك ما يكفي من XP للمراهنة.* لديك حاليًا *${formatExp(user.exp)} XP*`, m);
  }

  const resultColor = getRandomColor();
  const isWin = resultColor === color;
  let winAmount = 0;

  if (isWin) {
    winAmount = color === 'green' ? betAmount * 14 : betAmount * 2;
  }

  const newExp = user.exp - betAmount + winAmount;
  await m.db.query(`UPDATE usuarios SET exp = $1, wait = $2 WHERE id = $3`, [newExp, now, m.sender]);

  return conn.reply(
    m.chat,
    `🎰 *النتيجة:* ${translateColor(resultColor)}\n${isWin ? `🎉 ربحت *${formatExp(winAmount)} XP* 🎊` : `💀 خسرت *${formatExp(betAmount)} XP*`}`,
    m
  );
};

handler.help = ['روليت <اللون> <الكمية>'];
handler.tags = ['game'];
handler.command = ['روليت']; // تم تغيير الأمر إلى أمر عربي مباشر
handler.register = true;

export default handler;

// دوال المساعدة

function getRandomColor() {
  const random = Math.random() * 100;
  if (random < 47.5) return 'red';
  if (random < 95) return 'black';
  return 'green';
}

function formatExp(amount) {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k (${amount.toLocaleString()})`;
  return amount.toLocaleString();
}

function msToTime(duration) {
  if (isNaN(duration) || duration <= 0) return '0ث';
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes > 0 ? minutes + 'د ' : ''}${seconds}ث`;
}

function translateColor(color) {
  const map = { red: '🟥 أحمر', black: '⬛ أسود', green: '🟩 أخضر' };
  return map[color] || color;
}
