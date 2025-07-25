import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
const userMessages = new Map();
const userRequests = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`📌 *مثال للاستخدام:* ${usedPrefix + command} https://music.apple.com/us/album/glimpse-of-us/1625328890?i=1625328892`);

if (userRequests[m.sender]) {
conn.reply(m.chat, `⚠️ يا @${m.sender.split('@')[0]} انت بالفعل قاعد تحمل أغنية 😒\nانتظر انتهاء التحميل قبل طلب أغنية جديدة.`, userMessages.get(m.sender) || m);
return;
}

userRequests[m.sender] = true;
m.react("⌛");

try {
const downloadAttempts = [async () => {
const apiUrl = `${info.apis}/applemusicdl?url=${encodeURIComponent(text)}`;
const apiResponse = await fetch(apiUrl);
const delius = await apiResponse.json();
return { name: delius.data.name, artists: delius.data.artists, image: delius.data.image, duration: delius.data.duration, download: delius.data.download };
},
async () => {
const appledown = {
getData: async (urls) => {
const url = `https://aaplmusicdownloader.com/api/applesearch.php?url=${urls}`;
const response = await axios.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'MyApp/1.0' } });
return response.data;
},
getAudio: async (trackName, artist, urlMusic, token) => {
const url = 'https://aaplmusicdownloader.com/api/composer/swd.php';
const data = { song_name: trackName, artist_name: artist, url: urlMusic, token: token };
const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'User-Agent': 'MyApp/1.0' };
const response = await axios.post(url, qs.stringify(data), { headers });
return response.data.dlink;
},
download: async (urls) => {
const musicData = await appledown.getData(urls);
if (!musicData || !musicData.success) throw new Error('❌ تعذر الحصول على بيانات الأغنية من Apple Downloader');
const encodedData = encodeURIComponent(JSON.stringify([musicData.name, musicData.albumname, musicData.artist, musicData.thumb, musicData.duration, musicData.url]));
const url = 'https://aaplmusicdownloader.com/song.php';
const headers = { 'content-type': 'application/x-www-form-urlencoded', 'User-Agent': 'MyApp/1.0' };
const data = `data=${encodedData}`;
const response = await axios.post(url, data, { headers });
const htmlData = response.data;
const $ = cheerio.load(htmlData);
const trackName = $('td:contains("Track Name:")').next().text();
const albumName = $('td:contains("Album:")').next().text();
const duration = $('td:contains("Duration:")').next().text();
const artist = $('td:contains("Artist:")').next().text();
const thumb = $('figure.image img').attr('src');
const urlMusic = urls;
const token = $('a#download_btn').attr('token');
const downloadLink = await appledown.getAudio(trackName, artist, urlMusic, token);
return { name: trackName, albumname: albumName, artist, url: urlMusic, thumb, duration, token, download: downloadLink };
}};

const dataos = await appledown.download(text);
return {
name: dataos.name,
artists: dataos.artist,
image: dataos.thumb,
duration: dataos.duration,
download: dataos.download,
url: dataos.url,
};
}];

let songData = null;

for (const attempt of downloadAttempts) {
try {
songData = await attempt();
if (songData) break;
} catch (err) {
console.error(`خطأ أثناء المحاولة: ${err.message}`);
continue;
}}

if (!songData) throw new Error('❌ لم نتمكن من تحميل الأغنية من أي مصدر');

const texto = `🎵 *العنوان:* ${songData.name}\n🎤 *الفنان:* ${songData.artists}\n⏱️ *المدة:* ${songData.duration}${songData.url ? `\n🌐 *الرابط:* ${songData.url}` : ''}`;

const coverMessage = await conn.sendFile(m.chat, songData.image, 'cover.jpg', texto, m);
userMessages.set(m.sender, coverMessage);

await conn.sendMessage(m.chat, {
document: { url: songData.download },
fileName: `${songData.name}.mp3`,
mimetype: 'audio/mp3'
}, { quoted: m });

m.react("✅");

} catch (e) {
console.error("خطأ نهائي:", e);
m.reply("❌ حدث خطأ أثناء محاولة تحميل الأغنية.");
m.react("❌");
} finally {
delete userRequests[m.sender];
}
};

handler.help = ['أبل_ميوزك'];
handler.tags = ['التحميل'];
handler.command = /^(أبل_ميوزك)$/i;
handler.register = true;
handler.limit = 1;

export default handler;
