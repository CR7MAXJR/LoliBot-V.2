const handler = async (m, { conn, args }) => {
  const cooldown = 30_000;
  const now = Date.now();

  const res = await m.db.query('SELECT exp, money, limite, wait FROM usuarios WHERE id = $1', [m.sender]);
  const user = res.rows[0];

  const last = Number(user?.wait) || 0;
  const remaining = last + cooldown - now;
  if (remaining > 0) return conn.reply(m.chat, `🕓 انتظر قليلًا، تبقى *${msToTime(remaining)}* قبل أن تلعب مجددًا.`, m);

  const tipoArg = (args[0] || '').toLowerCase();
  const tipo = tipoArg === 'xp' ? 'exp' : tipoArg;
  const cantidad = parseInt(args[1]);

  if (!['exp', 'money', 'limite'].includes(tipo)) return m.reply(`⚠️ الاستخدام الصحيح:\n/سلوت <xp|money|limite> <الكمية>\nمثال: /سلوت xp 500`);
  if (!cantidad || isNaN(cantidad) || cantidad < 10) return m.reply(`❌ الحد الأدنى للمراهنة هو 10`);

  const saldo = user[tipo];
  if (saldo < cantidad) return m.reply(`❌ لا تملك ما يكفي من *${tipoBonito(tipo)}*.\nرصيدك: *${formatNumber(saldo)}*`);

  const emojis = ['💎', '⚡', '🪙', '🧿', '💣', '🔮'];
  let final;
  const msg = await conn.sendMessage(m.chat, { text: renderRandom(emojis) }, { quoted: m });

  for (let i = 0; i < 6; i++) {
    await delay(300);
    if (i < 5) {
      await conn.sendMessage(m.chat, { text: renderRandom(emojis), edit: msg.key });
    } else {
      final = [
        [rand(emojis), rand(emojis), rand(emojis)],
        [rand(emojis), rand(emojis), rand(emojis)],
        [rand(emojis), rand(emojis), rand(emojis)],
      ];
      await conn.sendMessage(m.chat, { text: render(final), edit: msg.key });
    }
  }

  const resultado = evaluarLinea(final[1]);
  let ganancia = 0;
  let textoFinal = '';

  if (resultado === 'triple') {
    ganancia = cantidad * 3;
    textoFinal = `🎉 *مبروك!* حصلت على ثلاثة متطابقين!\nربحت *${formatNumber(ganancia)} ${tipoBonito(tipo)}*`;
  } else if (resultado === 'doble') {
    ganancia = cantidad;
    textoFinal = `😏 حصلت على اثنين متشابهين.\nاسترجعت *${formatNumber(ganancia)} ${tipoBonito(tipo)}*`;
  } else {
    ganancia = -cantidad;
    textoFinal = `💀 للأسف، خسرت *${formatNumber(cantidad)} ${tipoBonito(tipo)}*`;
  }

  const nuevoSaldo = saldo + ganancia;
  await m.db.query(`UPDATE usuarios SET ${tipo} = $1, wait = $2 WHERE id = $3`, [nuevoSaldo, now, m.sender]);
  await delay(600);
  await conn.sendMessage(m.chat, { text: render(final) + `\n\n${textoFinal}`, edit: msg.key });
};

handler.command = ['سلوت']; // اسم الأمر العربي
handler.help = ['سلوت <xp|money|limite> <الكمية>'];
handler.tags = ['game'];
handler.register = true;

export default handler;

// دوال مساعدة

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function render(matriz) {
  return `🎰 | *سلوت* | 🎰\n────────────\n${matriz.map(row => row.join(' | ')).join('\n')}\n────────────`;
}

function renderRandom(emojis) {
  const temp = [
    [rand(emojis), rand(emojis), rand(emojis)],
    [rand(emojis), rand(emojis), rand(emojis)],
    [rand(emojis), rand(emojis), rand(emojis)],
  ];
  return render(temp);
}

function evaluarLinea(arr) {
  const [a, b, c] = arr;
  if (a === b && b === c) return 'triple';
  if (a === b || b === c || a === c) return 'doble';
  return 'nada';
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function formatNumber(num) {
  return num.toLocaleString('en').replace(/,/g, '.');
}

function msToTime(duration) {
  const s = Math.floor(duration / 1000) % 60;
  const m = Math.floor(duration / (1000 * 60)) % 60;
  return `${m ? `${m} دقيقة و ` : ''}${s} ثانية`;
}

function tipoBonito(tipo) {
  if (tipo === 'money') return 'لولي كوينز';
  if (tipo === 'limite') return 'ألماس';
  return 'نقاط خبرة';
      }
