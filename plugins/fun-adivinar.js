import fs from 'fs';
import fetch from 'node-fetch';
import similarity from 'similarity';

const timeout = 50000;
const timeout2 = 20000;
const poin = 500;
const threshold = 0.72;
const juegos = {};
const preguntasUsadas = new Set();

const archivosRespaldo = {
  acertijo: "acertijo.json",
  pelicula: "peliculas.json",
  trivia: "trivia.json"
};

async function obtenerPregunta(tipo) {
  const prompt = {
    acertijo: "Genera un acertijo con su respuesta en formato JSON: {\"question\": \"<السؤال>\", \"response\": \"<الإجابة>\"}.",
    pelicula: "Genera un juego para تخمين فيلم باستخدام الرموز التعبيرية كدليل، formato JSON: {\"question\": \"<السؤال>\", \"response\": \"<الإجابة>\"}.",
    trivia: "Genera una trivia en formato JSON: {\"question\": \"<السؤال>\\n\\nA) ...\\nB) ...\\nC) ...\", \"response\": \"<الحرف الصحيح>\"}."
  }[tipo];

  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(`https://api.neoxr.eu/api/gptweb?text=${encodeURIComponent(prompt)}&apikey=russellxz`);
      if (!res.ok || res.headers.get('content-type')?.includes('text/html')) throw new Error(`استجابة API غير صالحة (${res.status})`);
      const json = await res.json();
      if (json?.data) {
        const match = json.data.match(/```json\s*([\s\S]*?)\s*```/);
        const clean = match ? match[1] : json.data;
        const obj = JSON.parse(clean);
        if (obj.question && obj.response && !preguntasUsadas.has(obj.question)) {
          preguntasUsadas.add(obj.question);
          return obj;
        }
      }
    } catch (e) {
      console.error('[نسخة احتياطية IA]', e.message || e);
    }
  }

  try {
    const archivo = `./src/game/${archivosRespaldo[tipo]}`;
    const data = JSON.parse(fs.readFileSync(archivo));
    const pregunta = data[Math.floor(Math.random() * data.length)];
    preguntasUsadas.add(pregunta.question);
    return pregunta;
  } catch (e) {
    console.error('فشل النسخة الاحتياطية', e);
    return null;
  }
}

let handler = async (m, { conn, command }) => {
  const id = m.chat;
  if (juegos[id]) return conn.reply(m.chat, '⚠️ يوجد لعبة نشطة بالفعل في هذه المحادثة.', m);

  // تعريب وتبسيط تحديد نوع اللعبة بناءً على الأمر
  // الأمر يمكن أن يكون: acertijo -> احجية, pelicula أو adv -> فيلم, trivia -> أسئلة
  let tipo = null;
  if (/^(احجية|حزورة|acertijo|acert|adivinanza|tekateki)$/i.test(command)) tipo = 'acertijo';
  else if (/^(فيلم|adv|pelicula|adivinar-pelicula|تخمين-فيلم|تخمينفيلم)$/i.test(command)) tipo = 'pelicula';
  else if (/^(أسئلة|تريفيا|trivia|تريڤيا)$/i.test(command)) tipo = 'trivia';

  if (!tipo) return;

  const pregunta = await obtenerPregunta(tipo);
  if (!pregunta) return m.reply('❌ لم أتمكن من توليد السؤال.');

  const tiempo = tipo === 'trivia' ? timeout2 : timeout;
  const texto = `${pregunta.question}

*• الوقت:* ${tiempo / 1000} ثواني\n*• المكافأة:* +${poin} نقاط خبرة (XP)`;
  const enviado = await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

  juegos[id] = {
    tipo,
    pregunta,
    caption: enviado,
    puntos: poin,
    intentos: 3,
    timeout: setTimeout(() => {
      if (juegos[id]) {
        conn.reply(m.chat, `⏳ انتهى الوقت.\n*الإجابة:* ${pregunta.response}`, enviado);
        delete juegos[id];
      }
    }, tiempo)
  };
};

handler.before = async (m, { conn }) => {
  const id = m.chat;
  if (!juegos[id] || !m.quoted?.key?.id || !juegos[id].caption?.key?.id || m.quoted.key.id !== juegos[id].caption.key.id) return;

  const juego = juegos[id];
  const correcta = juego.pregunta.response.toLowerCase().trim();
  const userInput = m.originalText.toLowerCase().trim();
  const esCorrecta = userInput === correcta || similarity(userInput, correcta) >= threshold;

  if (esCorrecta) {
    await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [juego.puntos, m.sender]);
    m.reply(`✅ *صحيح!*\nلقد ربحت +${juego.puntos} نقاط خبرة (XP)`);
    clearTimeout(juego.timeout);
    delete juegos[id];
  } else {
    juego.intentos--;
    if (juego.intentos <= 0) {
      m.reply(`❌ لقد أخطأت 3 مرات. الإجابة الصحيحة كانت: *${juego.pregunta.response}*`);
      clearTimeout(juego.timeout);
      delete juegos[id];
    } else {
      m.reply(`❌ خطأ. لديك *${juego.intentos}* محاولة(محاولات) متبقية.`);
    }
  }
};

handler.help = ['احجية', 'فيلم', 'تريفيا'];
handler.tags = ['game'];
// تعريف الأوامر بالعربي مع دعم الاختصارات والشرطات حسب طلبك
handler.command = /^(احجية|حزورة|acertijo|acert|adivinanza|tekateki|فيلم|adv|pelicula|adivinar-pelicula|تخمين-فيلم|تخمينفيلم|أسئلة|تريفيا|trivia|تريڤيا)$/i;
handler.register = true;

export default handler;
