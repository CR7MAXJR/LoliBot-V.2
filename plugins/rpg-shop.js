const xpperlimit = 750;

const handler = async (m, { conn, command, args }) => {
  const res = await m.db.query("SELECT exp, limite FROM usuarios WHERE id = $1", [m.sender]);
  let user = res.rows[0];
  let count = 1;

  if (/الكل/i.test(command) || (args[0] && /الكل/i.test(args[0]))) {
    count = Math.floor(user.exp / xpperlimit);
  } else {
    count = parseInt(args[0]) || parseInt(command.replace(/^شراء/i, "")) || 1;
  }

  count = Math.max(1, count);
  const totalCost = xpperlimit * count;

  if (user.exp < totalCost) {
    return m.reply(`⚠️ عذرًا، لا تملك ما يكفي من *الخبرة* لشراء *${count}* 💎`);
  }

  await m.db.query(`
    UPDATE usuarios 
    SET exp = exp - $1, limite = limite + $2 
    WHERE id = $3
  `, [totalCost, count, m.sender]);

  await m.reply(`╔═❖ *إيصال شراء*\n║‣ *العدد المشترا:* ${count} 💎\n║‣ *المبلغ المدفوع:* ${totalCost} خبرة\n╚═══════════════`);
};

handler.help = ['شراء [العدد]', 'شراء الكل'];
handler.tags = ['اقتصاد'];
handler.command = /^شراء(الكل)?$/i;
handler.register = true;

export default handler;
