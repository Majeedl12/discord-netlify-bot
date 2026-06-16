const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const token = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

let allowedRoles = [];

const FULL_HTML = `<!DOCTYPE html>
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
            transform: translate3d(0,0,0);
            animation: gridShift 15s linear infinite;
        }
        @keyframes gridShift { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(50px, 50px, 0); } }

        .floating-icons-layer {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 0; overflow: hidden;
        }
        
        .floating-icon {
            position: absolute; color: rgba(255,255,255,0.05);
        }
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
            background: rgba(5,5,5,0.92); 
            border: 1px solid rgba(255,255,255,0.15); border-radius: 24px;
            z-index: 1000; 
            transform: translate3d(280px, 0, 0);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 30px 20px; display: flex; flex-direction: column; gap: 24px;
        }
        .side-menu.open { transform: translate3d(0, 0, 0); }
        
        .side-menu-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.55); z-index: 999; opacity: 0; pointer-events: none;
            transition: opacity 0.4s ease;
        }
        .side-menu-overlay.active { opacity: 1; pointer-events: auto; }
        .side-menu-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .side-menu-header { font-size: 18px; font-weight: 900; color: #fff; }
        .side-menu-close {
            width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.2); cursor: pointer; position: relative; transition: all 0.3s ease;
        }
        .side-menu-close:hover { background: rgba(255,60,60,0.1); border-color: rgba(255,80,80,0.6); }
        .side-menu-close::before, .side-menu-close::after {
            content: ''; position: absolute; top: 50%; left: 50%;
            width: 14px; height: 1.5px; background: rgba(255,255,255,0.7); border-radius: 2px;
        }
        .side-menu-close::before { transform: translate(-50%,-50%) rotate(45deg); }
        .side-menu-close::after { transform: translate(-50%,-50%) rotate(-45deg); }
        
        .menu-section { display: flex; flex-direction: column; gap: 8px; }
        .menu-section-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; padding: 0 4px; margin-bottom: 2px; }
        .menu-btn { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.3s ease; }
        .menu-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
        .menu-btn.full { font-size: 15px; font-weight: 700; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); }
        .menu-row { display: flex; gap: 8px; }
        .menu-row .menu-btn { flex: 1; font-size: 13px; }
        
        .menu-toggle {
            position: fixed; top: 20px; right: 20px; z-index: 998; width: 40px; height: 40px; border-radius: 12px;
            background: rgba(10,10,10,0.85); border: 1px solid rgba(255,255,255,0.2);
            display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;
        }
        .menu-toggle:hover { border-color: rgba(255,255,255,0.5); }
        .menu-toggle span { width: 20px; height: 2px; background: rgba(255,255,255,0.8); position: relative; }
        .menu-toggle span::before, .menu-toggle span::after { content: ''; position: absolute; width: 20px; height: 2px; background: rgba(255,255,255,0.8); }
        .menu-toggle span::before { top: -6px; } .menu-toggle span::after { top: 6px; }

        .main-container { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1200px; margin-top: 10px; }
        .cards-grid { display: flex; gap: clamp(20px,4vw,40px); justify-content: center; width: 100%; flex-wrap: wrap; margin-top: 10px; }
        
        .section-title, .card, .links {
            opacity: 0;
            transform: translate3d(0, 15px, 0);
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .section-title.reveal, .card.reveal, .links.reveal {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }

        .card {
            background: rgba(5,5,5,0.85); 
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 24px; padding: 35px 30px 40px 30px; text-align: center; width: 100%; max-width: 550px; min-width: 320px;
            display: flex; flex-direction: column; align-items: center; cursor: pointer;
            box-shadow: 0 0 0px rgba(255, 255, 255, 0);
            transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .card.highlighted { 
            border-color: rgba(255,255,255,0.45); 
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.25); 
        }
        
        .app-img { width: 100%; height: auto; max-height: 440px; aspect-ratio: 16/13; border-radius: 16px; object-fit: cover; margin-bottom: 25px; background: transparent; }
        
        .name { 
            font-size: 28px; 
            font-weight: 900; 
            color: #fff; 
            margin-bottom: 2px; 
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.25); 
        }
        
        .version { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 5px; }
        
        .section-title { 
            font-size: 32px; 
            font-weight: 900; 
            color: #fff; 
            margin-bottom: 35px; 
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.3); 
        }
        
        .links { display: flex; gap: 12px; justify-content: center; margin-top: 50px; }
        .link-btn { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s ease; border: 1px solid rgba(255,255,255,0.15); background: rgba(5,5,5,0.8); }
        .link-btn svg { width: 24px; height: 24px; fill: rgba(255,255,255,0.6); }
        .link-btn:hover { border-color: rgba(255,255,255,0.4); }
        
        .download-btn { width: 100%; padding: 14px; background: rgba(5,5,5,0.7); font-weight: 700; font-size: 16px; border-radius: 12px; margin-top: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.2); display: block; transition: border-color 0.3s ease, background 0.3s ease; color: #fff; }
        .download-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.4); }
        .download-btn.loading { pointer-events: none; opacity: 0.7; }
        
        @media (min-width: 768px) { body { align-items: center; } .cards-grid { flex-wrap: nowrap; } .card { flex: 1; max-width: 550px; } .app-img { max-height: 380px; } }
        @media (min-width: 1024px) { .cards-grid { gap: 50px; } .card { max-width: 580px; } .app-img { max-height: 440px; } }
    </style>
</head>
<body>

    <div class="grid-bg"></div>
    <div class="floating-icons-layer" id="floatingIconsLayer"></div>

    <div class="menu-toggle" onclick="toggleMenu()"><span></span></div>
    <div class="side-menu-overlay" onclick="closeMenu()"></div>
    <div class="side-menu" id="side-menu">
        <div class="side-menu-top"><div class="side-menu-header">القائمة</div><div class="side-menu-close" onclick="closeMenu()"></div></div>
        <div class="menu-section">
            <span class="menu-section-label">الرئيسية</span>
            <a href="https://amc-team.netlify.app/" class="menu-btn full">فريق AMC</a>
            <div class="menu-row">
                <a href="https://amc-ios.netlify.app/" class="menu-btn">ايفون</a>
                <a href="https://amc-pc.netlify.app/" class="menu-btn">بيسي</a>
            </div>
        </div>
        <div class="menu-section"><span class="menu-section-label">روابط</span><div class="menu-row"><a href="https://discord.gg/exaSkee62g" target="_blank" class="menu-btn">Discord</a><a href="https://github.com/Majeedl12" target="_blank" class="menu-btn">GitHub</a></div><a href="https://www.youtube.com/@axis_executor" target="_blank" class="menu-btn">YouTube</a></div>
    </div>

    <div class="main-container" id="main-container">
        <div class="section-title" id="sec-title">هاكات - Android</div>
        <div class="cards-grid">
            <div class="card" id="card-1" onclick="highlightCard(this, event)">
                <img class="app-img" src="https://deltaexploits.gg/assets/android.webp" alt="DELTA">
                <div class="name">DELTA</div><div class="version">الاصدار الاخير</div>
                <a href="#" class="download-btn" onclick="downloadWithDelay(event, 'LINK_DELTA')">تثبيت</a>
            </div>
            <div class="card" id="card-2" onclick="highlightCard(this, event)">
                <img class="app-img" src="https://techylist.com/wp-content/uploads/2022/11/arceus-x-first.jpeg" alt="Arceus Neo">
                <div class="name">Arceus Neo</div><div class="version">الاصدار الاخير</div>
                <a href="#" class="download-btn" onclick="downloadWithDelay(event, 'LINK_ARCEUS')">تثبيت</a>
            </div>
        </div>
        <div class="links" id="sec-links">
            <a href="https://github.com/Majeedl12" target="_blank" class="link-btn"><svg viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
            <a href="https://discord.gg/exaSkee62g" target="_blank" class="link-btn"><svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></a>
            <a href="https://www.youtube.com/@axis_executor" target="_blank" class="link-btn"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        </div>
    </div>

    <script>
        function toggleMenu() { document.getElementById('side-menu').classList.toggle('open'); document.querySelector('.side-menu-overlay').classList.toggle('active'); }
        function closeMenu() { document.getElementById('side-menu').classList.remove('open'); document.querySelector('.side-menu-overlay').classList.remove('active'); }
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });

        function createFloatingIcons() {
            const layer = document.getElementById('floatingIconsLayer');
            if (!layer || typeof lucide === 'undefined') { setTimeout(createFloatingIcons, 100); return; }
            layer.innerHTML = '';
            const icons = ['code-xml', 'terminal', 'star', 'sparkles', 'crown', 'zap'];
            icons.forEach((iconName, i) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'floating-icon';
                const size = 60 + i * 6;
                wrapper.style.width = size + 'px';
                wrapper.style.height = size + 'px';
                if (i < 3) { wrapper.style.left = (8 + i * 28) % 92 + '%'; wrapper.style.top = (4 + i * 12) % 35 + '%'; }
                else { wrapper.style.left = (12 + (i-3) * 30) % 90 + '%'; wrapper.style.top = (62 + (i-3) * 10) % 88 + '%'; }
                const iconEl = document.createElement('i');
                iconEl.setAttribute('data-lucide', iconName);
                wrapper.appendChild(iconEl);
                layer.appendChild(wrapper);
            });
            lucide.createIcons();
        }

        document.addEventListener('DOMContentLoaded', function() {
            createFloatingIcons();
            
            const title = document.getElementById('sec-title');
            const card1 = document.getElementById('card-1');
            const card2 = document.getElementById('card-2');
            const links = document.getElementById('sec-links');

            setTimeout(() => { title.classList.add('reveal'); }, 50);
            setTimeout(() => { card1.classList.add('reveal'); }, 120);
            setTimeout(() => { card2.classList.add('reveal'); }, 200);
            setTimeout(() => { links.classList.add('reveal'); }, 280);
        });

        var currentHighlighted = null;
        function highlightCard(card, event) { event.stopPropagation(); if (currentHighlighted && currentHighlighted !== card) currentHighlighted.classList.remove('highlighted'); if (card.classList.contains('highlighted')) { card.classList.remove('highlighted'); currentHighlighted = null; } else { card.classList.add('highlighted'); currentHighlighted = card; } }
        document.addEventListener('click', function(e) { if (!e.target.closest('.card') && currentHighlighted) { currentHighlighted.classList.remove('highlighted'); currentHighlighted = null; } });
        function downloadWithDelay(event, url) { event.preventDefault(); event.stopPropagation(); var btn = event.currentTarget; if (btn.classList.contains('loading')) return; btn.classList.add('loading'); setTimeout(function() { btn.classList.remove('loading'); window.open(url, '_blank'); }, 1000); }
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        document.addEventListener('keydown', function(e) { if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'c')) e.preventDefault(); });
    </script>
</body>
</html>`;

let waitingForLink = new Map();

async function updateNetlifyFile(content) {
    try {
        const response = await axios.post(
            `https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`,
            {
                files: {
                    'index.html': content
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${NETLIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Netlify error:', error.response?.data || error.message);
        return null;
    }
}

function updateLink(html, hackKey, newLink) {
    const placeholders = {
        delta: 'LINK_DELTA',
        arceus: 'LINK_ARCEUS'
    };
    
    const placeholder = placeholders[hackKey];
    if (!placeholder) return html;
    
    return html.replace(placeholder, newLink);
}

function hasPermission(member) {
    if (member.id === member.guild.ownerId) return true;
    return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('تحديد رتبة مسموح لها بتحديث الروابط (للمالك فقط)')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('اختر الرتبة')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('android')
        .setDescription('تحديث روابط تحميل الهاكات')
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Slash commands registered');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'setup') {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: 'هذا الأمر فقط لمالك السيرفر', ephemeral: true });
        }
        
        const role = interaction.options.getRole('role');
        allowedRoles = [role.id];
        await interaction.reply({ content: `تم تعيين رتبة ${role.name} لتحديث الروابط`, ephemeral: true });
    }
    
    if (interaction.commandName === 'android') {
        if (!hasPermission(interaction.member)) {
            return interaction.reply({ content: 'ليس لديك صلاحية', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('اختر الهاك')
            .setDescription('اختر الهاك الذي تريد تحديث رابط تحميله');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_hack')
                    .setPlaceholder('اختر الهاك')
                    .addOptions([
                        { label: 'DELTA', description: 'تحديث رابط تحميل DELTA', value: 'delta' },
                        { label: 'Arceus Neo', description: 'تحديث رابط تحميل Arceus Neo', value: 'arceus' }
                    ])
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content === '!setup') {
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('هذا الأمر فقط لمالك السيرفر');
        }
        const role = message.mentions.roles.first();
        if (!role) return message.reply('استخدم: !setup @رتبة');
        allowedRoles = [role.id];
        return message.reply(`تم تعيين رتبة ${role.name} لتحديث الروابط`);
    }
    
    if (message.content === '!android') {
        if (!hasPermission(message.member)) {
            return message.reply('ليس لديك صلاحية');
        }
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('اختر الهاك')
            .setDescription('اختر الهاك الذي تريد تحديث رابط تحميله');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_hack')
                    .setPlaceholder('اختر الهاك')
                    .addOptions([
                        { label: 'DELTA', description: 'تحديث رابط تحميل DELTA', value: 'delta' },
                        { label: 'Arceus Neo', description: 'تحديث رابط تحميل Arceus Neo', value: 'arceus' }
                    ])
            );

        await message.reply({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'select_hack') return;

    const hackKey = interaction.values[0];
    const hackName = hackKey === 'delta' ? 'DELTA' : 'Arceus Neo';

    waitingForLink.set(interaction.user.id, hackKey);

    await interaction.reply({ 
        content: `اخترت ${hackName} ارسل رابط التحميل الجديد`, 
        ephemeral: true 
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    const hackKey = waitingForLink.get(message.author.id);
    if (!hackKey) return;

    const newLink = message.content.trim();
    
    if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
        return message.reply('ارسل رابط صحيح');
    }

    try {
        let html = FULL_HTML;
        html = updateLink(html, hackKey, newLink);

        const result = await updateNetlifyFile(html);
        if (!result) {
            return message.reply('فشل تحديث الملف');
        }

        waitingForLink.delete(message.author.id);
        const hackName = hackKey === 'delta' ? 'DELTA' : 'Arceus Neo';
        await message.channel.send(`تم تحديث ${hackName} بنجاح`);
        
    } catch (error) {
        console.error(error);
        await message.reply('حدث خطأ');
    }
});

client.login(token);
