// تم التعريب بواسطة: https://github.com/elrebelde21

const pendingSales = new Map();
const cooldownTime = 3600000; // 1 ساعة

function calculateMaxPrice(basePrice, votes) {
  if (votes === 0) {
    return Math.round(basePrice * 1.05);
  }
  const maxIncreasePercentage = 0.3;
  const maxPrice = basePrice * (1 + maxIncreasePercentage * votes);
  return Math.round(maxPrice);
}

function calculateMinPrice(basePrice) {
  return Math.round(basePrice * 0.95);
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.db) return;

  try {
    const { rows: userCharacters } = await m.db.query('SELECT * FROM characters WHERE claimed_by = $1', [m.sender]);

    if (args.length < 2) {
      if (userCharacters.length === 0) return conn.reply(m.chat, '⚠️ ليس لديك أي شخصية مملوكة. قم بامتلاك واحدة أولًا.', m);
      let characterList = '📜 قائمة بشخصياتك:\n';
      userCharacters.forEach((character, index) => {
        characterList += `${index + 1}. ${character.name} - ${character.price} خبرة\n`;
      });
      return conn.reply(m.chat, `⚠️ طريقة الاستخدام:\n\n- لبيع شخصية لشخص معين:\n${usedPrefix + command} <اسم الشخصية> <السعر> @شخص\n\n- لعرض شخصية في السوق:\nمثال: ${usedPrefix + command} غوكو 9500\n\n${characterList}`, m);
    }

    const mentioned = m.mentionedJid[0] || null;
    const mentionIndex = args.findIndex(arg => arg.startsWith('@'));
    let price = args[args.length - 1];
    if (mentioned && mentionIndex !== -1) {
      price = args[args.length - 2];
    }

    price = parseInt(price);
    if (isNaN(price) || price <= 0) return conn.reply(m.chat, '⚠️ يرجى تحديد سعر صالح للشخصية.', m);

    const nameParts = args.slice(0, mentioned ? -2 : -1);
    const characterName = nameParts.join(' ').trim();
    if (!characterName) return conn.reply(m.chat, '⚠️ لم يتم العثور على اسم الشخصية. تأكد وحاول مرة أخرى.', m);

    const characterToSell = userCharacters.find(
      c => c.name.toLowerCase() === characterName.toLowerCase()
    );

    if (!characterToSell) return conn.reply(m.chat, '⚠️ لم يتم العثور على الشخصية التي تحاول بيعها.', m);
    if (characterToSell.for_sale) return conn.reply(m.chat, '⚠️ هذه الشخصية معروضة للبيع بالفعل. استخدم الأمر `.سحب` لسحبها قبل إعادة نشرها.', m);

    if (characterToSell.last_removed_time) {
      const timeSinceRemoval = Date.now() - characterToSell.last_removed_time;
      if (timeSinceRemoval < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - timeSinceRemoval) / 60000);
        return conn.reply(m.chat, `⚠️ يجب الانتظار ${remainingTime} دقيقة قبل إعادة نشر *${characterToSell.name}*.`, m);
      }
    }

    const minPrice = calculateMinPrice(characterToSell.price);
    const maxPrice = calculateMaxPrice(characterToSell.price, characterToSell.votes || 0);
    if (price < minPrice) return conn.reply(m.chat, `⚠️ الحد الأدنى للسعر المسموح به لـ ${characterToSell.name} هو ${minPrice} خبرة.`, m);
    if (price > maxPrice) return conn.reply(m.chat, `⚠️ الحد الأقصى للسعر المسموح به لـ ${characterToSell.name} هو ${maxPrice} خبرة.`, m);

    if (mentioned) {
      if (pendingSales.has(mentioned)) return conn.reply(m.chat, '⚠️ هذا المستخدم لديه عرض معلق. انتظر قليلًا.', m);

      pendingSales.set(mentioned, {
        seller: m.sender,
        buyer: mentioned,
        character: characterToSell,
        price,
        timer: setTimeout(() => {
          pendingSales.delete(mentioned);
          conn.reply(m.chat, `⏰ @${mentioned.split('@')[0]} لم يرد على عرض *${characterToSell.name}*. تم إلغاء الطلب.`, m, { mentions: [mentioned] });
        }, 60000), // دقيقة واحدة
      });

      return conn.reply(m.chat, `📜 مرحبًا @${mentioned.split('@')[0]}، المستخدم @${m.sender.split('@')[0]} يريد بيعك *${characterToSell.name}* مقابل ${price} خبرة.\n\n- أرسل *أقبل* للشراء.\n- أرسل *أرفض* لإلغاء العرض.`, m, { mentions: [mentioned, m.sender] });
    } else {
      const previousPrice = characterToSell.price;
      await m.db.query('UPDATE characters SET price = $1, for_sale = true, seller = $2, previous_price = $3 WHERE id = $4', [price, m.sender, previousPrice, characterToSell.id]);
      return conn.reply(m.chat, `✅ تم عرض *${characterToSell.name}* في السوق مقابل ${price} خبرة.`, m);
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ حدث خطأ أثناء معالجة البيع. حاول مرة أخرى.', m);
  }
};

handler.before = async (m, { conn }) => {
  const buyerId = m.sender;
  const sale = pendingSales.get(buyerId);
  if (!sale) return;
  if (!m.db) return;

  const response = m.originalText.toLowerCase();
  if (response === 'أقبل') {
    const { seller, buyer, character, price } = sale;
    try {
      const { rows } = await m.db.query('SELECT exp FROM usuarios WHERE id = $1', [buyer]);
      const buyerData = rows[0];
      if (!buyerData || buyerData.exp < price) {
        pendingSales.delete(buyerId);
        clearTimeout(sale.timer);
        return conn.reply(m.chat, '⚠️ ليس لديك خبرة كافية لشراء هذه الشخصية.', m);
      }

      const sellerExp = Math.round(price * 0.75);
      await m.db.query('UPDATE usuarios SET exp = exp - $1 WHERE id = $2', [price, buyer]);
      await m.db.query('UPDATE usuarios SET exp = exp + $1 WHERE id = $2', [sellerExp, seller]);
      await m.db.query('UPDATE characters SET claimed_by = $1, price = $2, for_sale = false, seller = null WHERE id = $3', [buyer, price, character.id]);
      clearTimeout(sale.timer);
      pendingSales.delete(buyerId);

      return conn.reply(m.chat, `✅ @${buyer.split('@')[0]} اشترى *${character.name}* من @${seller.split('@')[0]} مقابل ${price} خبرة.`, m, { mentions: [buyer, seller] });
    } catch (e) {
      clearTimeout(sale.timer);
      pendingSales.delete(buyerId);
      return conn.reply(m.chat, '⚠️ حدث خطأ أثناء إتمام الشراء. حاول مرة أخرى.', m);
    }
  } else if (response === 'أرفض') {
    clearTimeout(sale.timer);
    pendingSales.delete(buyerId);
    return conn.reply(m.chat, `⚠️ تم رفض عرض الشراء على *${sale.character.name}*.`, m);
  }
};

handler.help = ['بيع'];
handler.tags = ['شخصيات'];
handler.command = ['بيع'];
handler.register = true;

export default handler;
