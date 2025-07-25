let handler = async (m, { conn, args }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://telegra.ph/file/2a1d71ab744b55b28f1ae.jpg')
  await conn.groupUpdateDescription(m.chat, `${args.join(" ")}`);
  m.react("✅️")
}

handler.help = ['الوصف'];
handler.tags = ['group'];
handler.command = /^(setdesk|setdesc|newdesc|descripción|descripcion|الوصف)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
