const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running and connected to Netlify!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const netlifyToken = process.env.NETLIFY_TOKEN;
const siteId = process.env.SITE_ID;

async function updateNetlifyLink(hackKey, newLink) {
    let html = '';
    
    try {
        const getFileResponse = await axios.get(`https://api.netlify.com/api/v1/sites/${siteId}/files/index.html`, {
            headers: { 'Authorization': `Bearer ${netlifyToken}` },
            responseType: 'text'
        });
        html = getFileResponse.data;
    } catch (e) {
        const siteResponse = await axios.get(`https://api.netlify.com/api/v1/sites/${siteId}`, {
            headers: { 'Authorization': `Bearer ${netlifyToken}` }
        });
        const screenshotUrl = siteResponse.data.screenshot_url || '';
        
        html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/png" href="https://files.catbox.moe/z10byb.jpg">
    <title>Amc - Android</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>
    <style>
        :root { --primary-rgb: 255, 255, 255; }
        * { 
            margin: 0; padding: 0; box-sizing: border-box; 
            user-select: none; -webkit-user-select: none; 
            -webkit-tap-highlight-color: transparent;
            text-decoration: none !important; outline: none !important; border: none;
        }
        html { scroll-behavior: smooth; background: #000; }
        body {
            background: #000; color: #fff; font-family: 'Cairo', sans-serif;
            min-height: 100vh; display: flex; align-items: flex-start; justify-content: center;
            overflow-x: hidden; overflow-y: auto; position: relative; padding: 30px 20px;
        }
        .grid-bg {
            position: fixed; top: -50px; left: -50px; width: calc(100% + 100px); height: calc(100% + 100px);
            background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 50px 50px; pointer-events: none; z-index: 0;
            transform: translate3d(0,0,0); animation: gridShift 15s linear infinite;
        }
        @keyframes gridShift { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(50px, 50px, 0); } }
        .floating-icons-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }
        .floating-icon { position: absolute; color: rgba(255,255,255,0.05); }
        .floating-icon:nth-child(1) { animation: floatLocal1 7s infinite alternate ease-in-out; }
        .floating-icon:nth-child(2) { animation: floatLocal2 6s infinite alternate ease-in-out -1.5s; }
        .floating-icon:nth-child(3) { animation: floatLocal3 8s infinite alternate ease-in-out -3s; }
        .floating-icon:nth-child(4) { animation: floatLocal1 6.5s infinite alternate ease-in-out -1s; }
        .floating-icon:nth-child(5) { animation: floatLocal2 7.5s infinite alternate ease-in-out -2.5s; }
        .floating-icon:nth-child(6) { animation: floatLocal3 5.5s infinite alternate ease-in-out -4s; }
        @keyframes floatLocal1 { 0% { transform: translate3d(0, 0, 0) rotate(0deg); } 100% { transform: translate3d(35px, 45px, 0) rotate(20deg); } }
        @keyframes floatLocal2 { 0% { transform: translate3d(0, 0, 0) rotate(0deg); } 100% { transform: translate3d(-40px, 30px, 0) rotate(-15deg); } }
        @keyframes floatLocal3 { 0% { transform: translate3d(0, 0, 0) rotate(0deg); } 100% { transform: translate3d(25px, -35px, 0) rotate(25deg); } }
        .side-menu {
            position: fixed; top: 15px; right: 15px; width: 240px; height: calc(100vh - 30px);
            background: rgba(5,5,5,0.92); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px;
            z-index: 1000; transform: translate3d(280px, 0, 0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); padding: 30px 20px; display: flex; flex-direction: column; gap: 24px;
        }
        .side-menu.open { transform: translate3d(0, 0, 0); }
        .side-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.55); z-index: 999; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
        .side-menu-overlay.active { opacity: 1; pointer-events: auto; }
        .side-menu-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .side-menu-header { font-size: 18px; font-weight: 900; color: #fff; }
        .side-menu-close { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); cursor: pointer; position: relative; transition: all 0.3s ease; }
        .side-menu-close::before, .side-menu-close::after { content: ''; position: absolute; top: 50%; left: 50%; width: 14px; height: 1.5px; background: rgba(255,255,255,0.7); border-radius: 2px; }
        .side-menu-close::before { transform: translate(-50%,-50%) rotate(45deg); } .side-menu-close::after { transform: translate(-50%,-50%) rotate(-45deg); }
        .menu-section { display: flex; flex-direction: column; gap: 8px; }
        .menu-section-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; padding: 0 4px; margin-bottom: 2px; }
        .menu-btn { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.3s ease; }
        .menu-btn.full { font-size: 15px; font-weight: 700; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); }
        .menu-row { display: flex; gap: 8px; } .menu-row .menu-btn { flex: 1; font-size: 13px; }
        .menu-toggle { position: fixed; top: 20px; right: 20px; z-index: 998; width: 40px; height: 40px; border-radius: 12px; background: rgba(10,10,10,0.85); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; }
        .menu-toggle span { width: 20px; height: 2px; background: rgba(255,255,255,0.8); position: relative; }
        .menu-toggle span::before, .menu-toggle span::after { content: ''; position: absolute; width: 20px; height: 2px; background: rgba(255,255,255,0.8); }
        .menu-toggle span::before { top: -6px; } .menu-toggle span::after { top: 6px; }
        .main-container { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1200px; margin-top: 10px; }
        .cards-grid { display: flex; gap: clamp(20px,4vw,40px); justify-content: center; width: 100%; flex-wrap: wrap; margin-top: 10px; }
        .section-title, .card, .links { opacity: 0; transform: translate3d(0, 15px, 0); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
        .section-title.reveal, .card.reveal, .links.reveal { opacity: 1; transform: translate3d(0, 0, 0); }
        .card { background: rgba(5,5,5,0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 35px 30px 40px 30px; text-align: center; width: 100%; max-width: 550px; min-width: 320px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: border-color 0.4s, box-shadow 0.4s, transform 0.6s, opacity 0.6s; }
        .card.highlighted { border-color: rgba(255,255,255,0.45); box-shadow: 0 0 30px rgba(255, 255, 255, 0.25); }
        .app-img { width: 100%; height: auto; max-height: 440px; aspect-ratio: 16/13; border-radius: 16px; object-fit: cover; margin-bottom: 25px; }
        .name { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 2px; text-shadow: 0 0 12px rgba(255, 255, 255, 0.25); }
        .version { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 5px; }
        .section-title { font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 35px; text-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
        .links { display: flex; gap: 12px; justify-content: center; margin-top: 50px; }
        .link-btn { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); background: rgba(5,5,5,0.8); }
        .link-btn svg { width: 24px; height: 24px; fill: rgba(255,255,255,0.6); }
        .download-btn { width: 100%; padding: 14px; background: rgba(5,5,5,0.7); font-weight: 700; font-size: 16px; border-radius: 12px; margin-top: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.2); display: block; color: #fff; }
        .download-btn.loading { pointer-events: none; opacity: 0.7; }
        @media (min-width: 768px) { body { align-items: center; } .cards-grid { flex-wrap: nowrap; } .card { flex: 1; max-width: 550px; } }
    </style>
</head>
<body>
    <div class="grid-bg"></div><div class="floating-icons-layer" id="floatingIconsLayer"></div>
    <div class="menu-toggle" onclick="toggleMenu()"><span></span></div>
    <div class="side-menu-overlay" onclick="closeMenu()"></div>
    <div class="side-menu" id="side-menu">
        <div class="side-menu-top"><div class="side-menu-header">القائمة</div><div class="side-menu-close" onclick="closeMenu()"></div></div>
        <div class="menu-section">
            <span class="menu-section-label">الرئيسية</span>
            <a href="https://amc-team.netlify.app/" class="menu-btn full">فريق AMC</a>
            <div class="menu-row"><a href="https://amc-ios.netlify.app/" class="menu-btn">ايفون</a><a href="https://amc-pc.netlify.app/" class="menu-btn">بيسي</a></div>
        </div>
    </div>
    <div class="main-container" id="main-container">
        <div class="section-title" id="sec-title">هاكات - Android</div>
        <div class="cards-grid">
            <div class="card" id="card-1" onclick="highlightCard(this, event)">
                <img class="app-img" src="https://deltaexploits.gg/assets/android.webp" alt="DELTA">
                <div class="name">DELTA</div><div class="version">الاصدار الاخير</div>
                <a href="#" class="download-btn" onclick="downloadWithDelay(event, 'https://github.com/Majeedl12/Majed.dev/releases/download/Delta/Delta-2.724.735.apk')">تثبيت</a>
            </div>
            <div class="card" id="card-2" onclick="highlightCard(this, event)">
                <img class="app-img" src="https://techylist.com/wp-content/uploads/2022/11/arceus-x-first.jpeg" alt="Arceus Neo">
                <div class="name">Arceus Neo</div><div class="version">الاصدار الاخير</div>
                <a href="#" class="download-btn" onclick="downloadWithDelay(event, 'https://github.com/Majeedl12/Majed.dev/releases/download/Arceus_1/Roblox.Arceus.X.NEO.2.2.3.apk')">تثبيت</a>
            </div>
        </div>
    </div>
    <script>
        function toggleMenu() { document.getElementById('side-menu').classList.toggle('open'); document.querySelector('.side-menu-overlay').classList.toggle('active'); }
        function closeMenu() { document.getElementById('side-menu').classList.remove('open'); document.querySelector('.side-menu-overlay').classList.remove('active'); }
        function createFloatingIcons() {
            const layer = document.getElementById('floatingIconsLayer'); if (!layer || typeof lucide === 'undefined') { setTimeout(createFloatingIcons, 100); return; }
            layer.innerHTML = ''; const icons = ['code-xml', 'terminal', 'star'];
            icons.forEach((iconName, i) => {
                const wrapper = document.createElement('div'); wrapper.className = 'floating-icon'; wrapper.style.width = '60px'; wrapper.style.height = '60px'; wrapper.style.left = (8 + i * 28) + '%'; wrapper.style.top = (4 + i * 12) + '%';
                const iconEl = document.createElement('i'); iconEl.setAttribute('data-lucide', iconName); wrapper.appendChild(iconEl); layer.appendChild(wrapper);
            }); lucide.createIcons();
        }
        document.addEventListener('DOMContentLoaded', function() { createFloatingIcons(); setTimeout(() => { document.getElementById('sec-title').classList.add('reveal'); document.getElementById('card-1').classList.add('reveal'); document.getElementById('card-2').classList.add('reveal'); }, 50); });
        var currentHighlighted = null; function highlightCard(card, event) { event.stopPropagation(); if (currentHighlighted && currentHighlighted !== card) currentHighlighted.classList.remove('highlighted'); if (card.classList.contains('highlighted')) { card.classList.remove('highlighted'); currentHighlighted = null; } else { card.classList.add('highlighted'); currentHighlighted = card; } }
        function downloadWithDelay(event, url) { event.preventDefault(); event.stopPropagation(); var btn = event.currentTarget; if (btn.classList.contains('loading')) return; btn.classList.add('loading'); setTimeout(function() { btn.classList.remove('loading'); window.open(url, '_blank'); }, 1000); }
    </script>
</body>
</html>`;
    }

    if (hackKey === 'delta') {
        html = html.replace(/<div class="card" id="card-1">[\s\S]*?downloadWithDelay\(event,\s*'([^']+)'\)/, (match, oldLink) => {
            return match.replace(oldLink, newLink);
        });
    } else if (hackKey === 'arceus') {
        html = html.replace(/<div class="card" id="card-2">[\s\S]*?downloadWithDelay\(event,\s*'([^']+)'\)/, (match, oldLink) => {
            return match.replace(oldLink, newLink);
        });
    }

    const zipBuffer = await createZipBuffer('index.html', html);

    await axios.post(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, zipBuffer, {
        headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/zip'
        }
    });
}

async function createZipBuffer(fileName, fileContent) {
    const archiver = require('archiver');
    const { Readable } = require('stream');
    return new Promise((resolve, reject) => {
        const bufs = [];
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('data', data => bufs.push(data));
        archive.on('end', () => resolve(Buffer.concat(bufs)));
        archive.on('error', err => reject(err));
        
        const s = new Readable();
        s.push(fileContent);
        s.push(null);
        archive.append(s, { name: fileName });
        archive.finalize();
    });
}

client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('android')
            .setDescription('تغيير رابط تحميل الهاك وعمل دبلوي على نيتليفاي')
            .addStringOption(option => 
                option.setName('hack')
                    .setDescription('اختر الهاك المراد تعديله')
                    .setRequired(true)
                    .addChoices(
                        { name: 'DELTA', value: 'delta' },
                        { name: 'Arceus Neo', value: 'arceus' }
                    )
            )
            .addStringOption(option => 
                option.setName('link')
                    .setDescription('ضع الرابط الجديد هنا')
                    .setRequired(true)
            )
    ];

    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'android') {
        const hackKey = interaction.options.getString('hack');
        const newLink = interaction.options.getString('link').trim();
        const hackName = hackKey === 'delta' ? 'DELTA' : 'Arceus Neo';

        if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
            return interaction.reply({ content: 'خطأ: يرجى إدخال رابط صحيح يبدأ بـ http أو https', ephemeral: true });
        }

        await interaction.reply({ content: `جاري تحديث رابط ${hackName} ورفع الـ Deploy إلى Netlify...`, ephemeral: true });

        try {
            await updateNetlifyLink(hackKey, newLink);
            await interaction.editReply({ content: `تم تحديث رابط ${hackName} بنجاح وتم عمل Deploy للموقع على Netlify!` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `حدث خطأ أثناء الـ Deploy: ${error.message}` });
        }
    }
});

client.login(token);
