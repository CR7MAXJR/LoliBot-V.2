const cooldown = 30_000;
const retos = new Map();
const jugadas = new Map();
const cooldowns = new Map();
const jugadasValidas = ['حجر', 'ورقة', 'مقص'];

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const now = Date.now();
  const userId = m.sender;
  const cooldownRestante = (cooldowns.get(userId) || 0) + cooldown - now;
  if (cooldownRestante > 0) return conn.fakeReply(m.chat, `*🕓 من فضلك انتظر ${msToTime(cooldownRestante)} قبل استخدام الأمر مرة أخرى.*`, m.sender, `لا تقم بالإزعاج`, 'status@broadcast');

  const res = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [userId]);
  const user = res.rows[0];
  const opponent = m.mentionedJid?.[0];
  const input = args[0]?.toLowerCase();

  if (!opponent && jugadasValidas.includes(input)) {
    cooldowns.set(userId, now);
    const botJugada = jugadasValidas[Math.floor(Math.random() * 3)];
    const resultado = evaluar(input, botJugada);
    const xp = Math.floor(Math.random() * 2000) + 500;

    let text = '';
    let result = '';
    if (resultado === 'gana') {
      await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [xp, userId]);
      text += `✅ *فزت!* وحصلت على *${formatNumber(xp)} XP*`;
      result = '🎉  فائز';
    } else if (resultado === 'pierde') {
      const nuevaXP = Math.max(0, user.exp - xp);
      await m.db.query('UPDATE usuarios SET exp = $1 WHERE id = $2', [nuevaXP, userId]);
      text += `❌ *خسرت.* تم خصم *${formatNumber(xp)} XP*`;
      result = '🤡  خاسر';
    } else {
      result = '🤝 تعادل';
      text += `🤝 *تعادل.* لم تربح أو تخسر XP.`;
    }

    return m.reply(`\`「 ${result} 」\`\n\n🤖 البوت: ${botJugada}\n👤 أنت: ${input}\n` + text);
  }

  if (opponent) {
    if (retos.has(opponent)) return m.reply('⚠️ هذا المستخدم لديه تحدي معلق بالفعل.');
    retos.set(opponent, {
      retador: userId,
      chat: m.chat,
      timeout: setTimeout(() => {
        retos.delete(opponent);
        conn.reply(m.chat, `⏳ *انتهى الوقت!* تم إلغاء التحدي لعدم الرد من @${opponent.split('@')[0]}`, m, { mentions: [opponent] });
      }, 60000)
    });

    return conn.reply(m.chat, `🎮👾 *تحدي حجر - ورقة - مقص*\n\n@${m.sender.split`@`[0]} يتحدى @${opponent.split('@')[0]}\n\n> _*اكتب (قبول) للموافقة*_\n> _*اكتب (رفض) لرفض التحدي*_`, m, { mentions: [opponent] });
  }

  m.reply(`🪨 *حجر*، 📄 *ورقة*، ✂️ *مقص*\n\n🤖 *للعب مع البوت:*\n• ${usedPrefix + command} حجر\n• ${usedPrefix + command} ورقة\n• ${usedPrefix + command} مقص\n\n👥 *للعب مع مستخدم آخر:*\n• ${usedPrefix + command} @user`);
};

handler.before = async (m, { conn }) => {
  const text = m.originalText?.toLowerCase();
  const userId = m.sender;

  if (['قبول', 'رفض'].includes(text) && retos.has(userId)) {
    const { retador, chat, timeout } = retos.get(userId);
    clearTimeout(timeout);
    retos.delete(userId);

    if (text === 'رفض') {
      return conn.reply(chat, `⚠️ @${userId.split('@')[0]} رفض التحدي.`, m, { mentions: [userId, retador] });
    }

    jugadas.set(chat, {
      jugadores: [retador, userId],
      eleccion: {},
      timeout: setTimeout(() => {
        jugadas.delete(chat);
        conn.reply(chat, `⏰ انتهى الوقت، تم إلغاء الجولة بسبب عدم التفاعل.`, m);
      }, 60000)
    });

    conn.reply(chat, `✅ تم قبول التحدي. سيتم إرسال الخيارات بشكل خاص لـ @${retador.split('@')[0]} و @${userId.split('@')[0]}.`, m, { mentions: [retador, userId] });

    await conn.sendMessage(retador, { text: '✊🖐✌️ اكتب *حجر*، *ورقة* أو *مقص* لاختيارك.' });
    await conn.sendMessage(userId, { text: '✊🖐✌️ اكتب *حجر*، *ورقة* أو *مقص* لاختيارك.' });
    return;
  }

  if (jugadasValidas.includes(text)) {
    for (const [chat, partida] of jugadas) {
      const { jugadores, eleccion, timeout } = partida;
      if (!jugadores.includes(userId)) continue;

      eleccion[userId] = text;
      await conn.sendMessage(userId, { text: '✅ تم تسجيل اختيارك، ارجع إلى المجموعة وانتظر النتيجة.' });

      if (Object.keys(eleccion).length < 2) return;
      clearTimeout(timeout);
      jugadas.delete(chat);

      const [j1, j2] = jugadores;
      const jugada1 = eleccion[j1];
      const jugada2 = eleccion[j2];
      const resultado = evaluar(jugada1, jugada2);
      const xp = Math.floor(Math.random() * 2000) + 500;
      let mensaje = `✊🖐✌️ *نتيجة التحدي*\n\n@${j1.split('@')[0]} اختار: *${jugada1}*\n@${j2.split('@')[0]} اختار: *${jugada2}*\n\n`;

      if (resultado === 'empate') {
        mensaje += '🤝 تعادل! لا يوجد فائز أو خاسر.';
      } else {
        const ganador = resultado === 'gana' ? j1 : j2;
        const perdedor = ganador === j1 ? j2 : j1;
        await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [xp * 2, ganador]);
        await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [xp, perdedor]);
        mensaje += `🏆 @${ganador.split('@')[0]} فاز بـ *${formatNumber(xp * 2)} XP*\n💔 @${perdedor.split('@')[0]} خسر *${formatNumber(xp)} XP*`;
      }

      return conn.sendMessage(chat, { text: mensaje, mentions: [j1, j2] });
    }
  }
};

handler.help = ['لعب-تحدي حجر|ورقة|مقص', 'لعب-تحدي @مستخدم'];
handler.tags = ['game'];
handler.command = ['لعب-تحدي'];
handler.register = true;

export default handler;

function evaluar(a, b) {
  if (a === b) return 'empate';
  if ((a === 'حجر' && b === 'مقص') || (a === 'مقص' && b === 'ورقة') || (a === 'ورقة' && b === 'حجر')) return 'gana';
  return 'pierde';
}

function formatNumber(n) {
  return n.toLocaleString('en').replace(/,/g, '.');
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  return `${m ? `${m} دقيقة ` : ''}${s} ثانية`;
}
