const handler = async (m, { conn, command, args }) => {
const res = await m.db.query('SELECT limite, banco FROM usuarios WHERE id = $1', [m.sender])
const user = res.rows[0]
const limite = user?.limite ?? 0
const banco = user?.banco ?? 0

if (command === 'ايداع') {
  if (!args[0]) return m.reply(`⚠️ اكتب عدد الألماس الذي تريد إيداعه في البنك.`)

  if (/الكل/i.test(args[0]) || /all/i.test(args[0])) {
    if (limite < 1) return m.reply(`💸 محفظتك فاضية، ما عندك ألماس!`)
    await m.db.query(`UPDATE usuarios SET limite = 0, banco = banco + $1 WHERE id = $2`, [limite, m.sender])
    return m.reply(`🏦 تم إيداع ${limite} ألماسة في حسابك البنكي.`)
  }

  if (isNaN(args[0])) return m.reply(`⚠️ يجب أن تكتب عدد صحيح من الألماس.`)
  const amount = parseInt(args[0])
  if (amount < 1) return m.reply(`❌ الحد الأدنى هو 1 ألماسة.`)
  if (limite < amount) return m.reply(`🙄 أنت ما تملك هذا العدد! استخدم الأمر #رصيدي لتعرف كم معك.`)

  await m.db.query(`UPDATE usuarios SET limite = limite - $1, banco = banco + $1 WHERE id = $2`, [amount, m.sender])
  return m.reply(`🏦 تم إيداع ${amount} ألماسة في البنك.`)
}

if (command === 'سحب') {
  if (!args[0]) return m.reply(`⚠️ اكتب عدد الألماس الذي تريد سحبه.`)

  if (/الكل/i.test(args[0]) || /all/i.test(args[0])) {
    if (banco < 1) return m.reply(`💀 حسابك البنكي فارغ، ما عندك شيء تسحبه.`)
    await m.db.query(`UPDATE usuarios SET banco = 0, limite = limite + $1 WHERE id = $2`, [banco, m.sender])
    return m.reply(`🏦 تم سحب ${banco} ألماسة من البنك إلى محفظتك.`)
  }

  if (isNaN(args[0])) return m.reply(`⚠️ يجب أن تكتب عدد صحيح من الألماس.`)
  const amount = parseInt(args[0])
  if (amount < 1) return m.reply(`❌ الحد الأدنى هو 1 ألماسة.`)
  if (banco < amount) return m.reply(`😅 أنت تحاول تسحب أكثر مما تملك! استخدم #رصيدي لمعرفة رصيدك.`)

  await m.db.query(`UPDATE usuarios SET banco = banco - $1, limite = limite + $1 WHERE id = $2`, [amount, m.sender])
  return m.reply(`🏦 تم سحب ${amount} ألماسة من البنك إلى محفظتك.`)
}}

handler.help = ['ايداع', 'سحب']
handler.tags = ['economia']
handler.command = /^(ايداع|سحب)$/i
handler.register = true

export default handler
