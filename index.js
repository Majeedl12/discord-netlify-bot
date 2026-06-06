import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let updateLogs = [];
let currentHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="https://files.catbox.moe/oukvke.png">
    <title>هاكات - Android</title>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"></noscript>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
        html{scroll-behavior:smooth}
        body{
            background:#000;color:#fff;font-family:'Cairo',sans-serif;min-height:100vh;
            display:flex;align-items:flex-start;justify-content:center;overflow-x:hidden;overflow-y:auto;
            position:relative;padding:30px 20px
        }
        .particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}
        .particle{position:absolute;background:radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%);border-radius:50%;animation:floatUp linear infinite;will-change:transform}
        @keyframes floatUp{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh) scale(1.5);opacity:0}}
        
        .main-container{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;width:100%;max-width:1200px;margin-top:10px}
        .cards-grid{display:flex;gap:clamp(20px, 4vw, 40px);justify-content:center;width:100%;flex-wrap:wrap;margin-top:10px}
        
        .card{
            background:rgba(5,5,5,0.7);
            border:1px solid rgba(59,130,246,0.2);
            box-shadow: 0 0 20px rgba(59,130,246,0.08);
            border-radius:24px;padding:35px 30px 40px 30px;text-align:center;
            width:100%;max-width:550px;min-width:320px;
            backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;
            cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;
            transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .card.highlighted{
            background:rgba(5,5,5,1);
            border-color: rgba(59,130,246,0.9);
            box-shadow: 0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.15);
        }
        .app-img{width:100%;height:auto;max-height:320px;aspect-ratio:16/11;border-radius:16px;object-fit:cover;margin-bottom:25px}
        
        .name{
            font-size:28px;font-weight:900;color:#fff;margin-bottom:2px;
            text-shadow: 0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.25);
            transition: text-shadow 0.3s ease;
        }
        .card.highlighted .name{
            text-shadow: 0 0 20px rgba(59,130,246,0.9), 0 0 40px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.25);
        }
        .version{
            font-size:14px;font-weight:600;color:rgba(59,130,246,0.6);
            margin-bottom:5px;
            text-shadow: 0 0 8px rgba(59,130,246,0.3);
        }
        .section-title{
            font-size:32px;font-weight:900;color:#fff;margin-bottom:35px;
            text-shadow: 0 0 15px rgba(59,130,246,0.5), 0 0 30px rgba(59,130,246,0.2);
        }
        
        .links{display:flex;gap:12px;justify-content:center;margin-top:50px}
        .link-btn{
            width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;
            cursor:pointer;transition:border-color 0.2s ease, box-shadow 0.2s ease;text-decoration:none;
            border:1px solid rgba(59,130,246,0.2);background:rgba(5,5,5,0.5);outline:none;
            backdrop-filter:blur(10px);
        }
        .link-btn svg{width:24px;height:24px;fill:rgba(59,130,246,0.7)}
        .link-btn:hover{
            border-color:rgba(59,130,246,0.5);
            box-shadow:0 0 20px rgba(59,130,246,0.2);
        }
        
        .download-btn{
            width:100%;padding:14px;background:rgba(5,5,5,0.4);font-weight:700;font-size:16px;
            border-radius:12px;text-decoration:none;margin-top:20px;text-align:center;
            border:1px solid rgba(59,130,246,0.25);
            backdrop-filter:blur(20px);display:block;
            transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, text-shadow 0.3s ease;
            color:#fff;
            text-shadow: 0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3);
        }
        .download-btn:hover{
            background:rgba(59,130,246,0.06);
            border-color: rgba(59,130,246,0.5);
            box-shadow: 0 0 30px rgba(59,130,246,0.15);
            text-shadow: 0 0 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.5);
        }
        .download-btn.loading{
            pointer-events:none;
            opacity:0.7;
        }

        @media (min-width: 768px) {
            body{align-items:center}
            .cards-grid{flex-wrap:nowrap}
            .card{flex:1;max-width:550px}
            .app-img{max-height:300px}
        }

        @media (min-width: 1024px) {
            .cards-grid{gap:50px}
            .card{max-width:580px}
            .app-img{max-height:320px}
        }
    </style>
</head>
<body>
<div class="particles" id="particles"></div>

<div class="main-container">
    <div class="section-title">هاكات - Android</div>
    
    <div class="cards-grid">
        <div class="card" onclick="highlightCard(this, event)">
            <img class="app-img" src="https://deltaexploits.gg/assets/android.webp" alt="DELTA">
            <div class="name">DELTA</div>
            <div class="version">الاصدار الاخير</div>
            <a href="#" onclick="downloadWithDelay(event, 'https://github.com/Majeedl12/Majed.dev/releases/download/Delta/Delta-2.721.1108.apk')" class="download-btn">تثبيت</a>
        </div>

        <div class="card" onclick="highlightCard(this, event)">
            <img class="app-img" src="https://techylist.com/wp-content/uploads/2022/11/arceus-x-first.jpeg" alt="Arceus Neo">
            <div class="name">Arceus Neo</div>
            <div class="version">الاصدار الاخير</div>
            <a href="#" onclick="downloadWithDelay(event, 'https://github.com/Majeedl12/Majed.dev/releases/download/Arceus_1/Roblox.Arceus.X.NEO.2.2.2.apk')" class="download-btn">تثبيت</a>
        </div>
    </div>

    <div class="links">
        <a href="https://github.com/Majeedl12" target="_blank" rel="noopener noreferrer" class="link-btn" aria-label="GitHub">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://discord.gg/exaSkee62g" target="_blank" rel="noopener noreferrer" class="link-btn" aria-label="Discord">
            <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </a>
        <a href="https://www.youtube.com/@axis_executor" target="_blank" rel="noopener noreferrer" class="link-btn" aria-label="YouTube">
            <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
    </div>
</div>

<script>
(function(){
    var c=document.getElementById('particles'),f=document.createDocumentFragment();
    for(var i=0;i<20;i++){
        var p=document.createElement('div');p.className='particle';
        var s=Math.random()*80+20;p.style.width=s+'px';p.style.height=s+'px';
        p.style.left=Math.random()*100+'%';p.style.animationDuration=(Math.random()*12+6)+'s';
        p.style.animationDelay=(Math.random()*8)+'s';f.appendChild(p);
    }
    c.appendChild(f);
})();

document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&(e.key==='u'||e.key==='s'||e.key==='p'||e.key==='c')){e.preventDefault()}
});

var currentHighlighted = null;

function highlightCard(card, event) {
    event.stopPropagation();
    if (currentHighlighted && currentHighlighted !== card) currentHighlighted.classList.remove('highlighted');
    if (card.classList.contains('highlighted')){card.classList.remove('highlighted');currentHighlighted=null}
    else{card.classList.add('highlighted');currentHighlighted=card}
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.card') && currentHighlighted) {
        currentHighlighted.classList.remove('highlighted');
        currentHighlighted = null;
    }
});

function downloadWithDelay(event, url) {
    event.preventDefault();
    event.stopPropagation();
    var btn = event.currentTarget;
    if (btn.classList.contains('loading')) return;
    btn.classList.add('loading');
    setTimeout(function() {
        btn.classList.remove('loading');
        window.open(url, '_blank');
    }, 1000);
}
</script>
</body>
</html>`;

async function deployToNetlify(content) {
    const sha1 = createHash("sha1").update(content).digest("hex");
    const createRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "/index.html": sha1 } })
    });
    if (!createRes.ok) return { ok: false };
    const { id: deployId } = await createRes.json();
    const uploadRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}/files/index.html`, {
        method: "PUT", headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }, body: content
    });
    if (!uploadRes.ok) return { ok: false };
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const statusRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
            headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }
        });
        if (statusRes.ok) {
            const { state } = await statusRes.json();
            if (state === "ready") return { ok: true };
            if (state === "error") return { ok: false };
        }
    }
    return { ok: false };
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    try {
        const siteUrl = `https://${SITE_ID}.netlify.app`;
        const res = await fetch(siteUrl);
        if (res.ok) {
            currentHtml = await res.text();
            console.log("Loaded current HTML from Netlify");
        }
    } catch (e) {
        console.log("Error fetching from Netlify, using default");
    }
    
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), {
        body: [
            {
                name: "app",
                description: "رفع ملف HTML",
                options: [{ type: 11, name: "file", description: "الملف", required: true }]
            },
            {
                name: "version",
                description: "تغيير حالة الهاك",
                options: [
                    { type: 3, name: "hack", description: "DELTA or Arceus Neo", required: true, choices: [{ name: "DELTA", value: "DELTA" }, { name: "Arceus Neo", value: "Arceus Neo" }] },
                    { type: 3, name: "status", description: "الحالة", required: true, choices: [{ name: "الاصدار الاخير", value: "الاصدار الاخير" }, { name: "يوجد تحديث", value: "يوجد تحديث" }] }
                ]
            },
            {
                name: "link",
                description: "تغيير رابط التحميل",
                options: [
                    { type: 3, name: "hack", description: "DELTA or Arceus Neo", required: true, choices: [{ name: "DELTA", value: "DELTA" }, { name: "Arceus Neo", value: "Arceus Neo" }] },
                    { type: 3, name: "url", description: "الرابط", required: true }
                ]
            },
            {
                name: "announce",
                description: "ارسال اعلان",
                options: [
                    { type: 7, name: "channel", description: "القناة", required: true },
                    { type: 3, name: "message", description: "النص", required: true }
                ]
            },
            {
                name: "logs",
                description: "اخر 10 تغييرات"
            },
            {
                name: "design",
                description: "تغيير اللون",
                options: [
                    { type: 3, name: "color", description: "اللون", required: true, choices: [
                        { name: "ازرق", value: "#3b82f6" },
                        { name: "اخضر", value: "#10b981" },
                        { name: "احمر", value: "#ef4444" },
                        { name: "بنفسجي", value: "#8b5cf6" }
                    ]}
                ]
            },
            {
                name: "stats",
                description: "احصائيات التحميلات"
            },
            {
                name: "users",
                description: "احصائيات الزوار",
                options: [
                    { type: 7, name: "channel", description: "القناة", required: true }
                ]
            }
        ]
    });
    console.log("Commands registered");
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    await interaction.deferReply();
    
    if (interaction.commandName === "app") {
        const file = interaction.options.getAttachment("file");
        if (!file || !file.name.endsWith(".html")) return interaction.editReply("يرجى رفع ملف html");
        const res = await fetch(file.url);
        currentHtml = await res.text();
        const { ok } = await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تم رفع ملف جديد`);
        interaction.editReply(ok ? `تم النشر\nhttps://${SITE_ID}.netlify.app` : "فشل النشر");
    }
    else if (interaction.commandName === "version") {
        const hack = interaction.options.getString("hack");
        const status = interaction.options.getString("status");
        if (hack === "DELTA") {
            currentHtml = currentHtml.replace(/<div class="version">الاصدار الاخير<\/div>/, `<div class="version">${status}</div>`);
        } else {
            let replaced = false;
            currentHtml = currentHtml.replace(/<div class="version">الاصدار الاخير<\/div>/g, (match) => {
                if (!replaced) { replaced = true; return `<div class="version">${status}</div>`; }
                return match;
            });
        }
        const { ok } = await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تم تغيير حالة ${hack} إلى ${status}`);
        interaction.editReply(ok ? `تم تغيير حالة ${hack}` : "فشل التغيير");
    }
    else if (interaction.commandName === "link") {
        const hack = interaction.options.getString("hack");
        const url = interaction.options.getString("url");
        const linkPattern = /(downloadWithDelay\(event, ')(.*?)('\))/g;
        const matches = [...currentHtml.matchAll(linkPattern)];
        const idx = hack === "DELTA" ? 0 : 1;
        if (matches[idx]) {
            currentHtml = currentHtml.slice(0, matches[idx].index + 24) + url + currentHtml.slice(matches[idx].index + 24 + matches[idx][2].length);
        }
        const { ok } = await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تم تغيير رابط ${hack}`);
        interaction.editReply(ok ? `تم تغيير رابط ${hack}` : "فشل التغيير");
    }
    else if (interaction.commandName === "announce") {
        const channel = interaction.options.getChannel("channel");
        const message = interaction.options.getString("message");
        if (!channel.isTextBased()) return interaction.editReply("القناة غير صالحة");
        await channel.send(message);
        interaction.editReply("تم");
    }
    else if (interaction.commandName === "logs") {
        if (updateLogs.length === 0) return interaction.editReply("لا يوجد");
        const logList = updateLogs.slice(-10).reverse().map((log, i) => `${i+1}. ${log}`).join("\n");
        interaction.editReply(logList);
    }
    else if (interaction.commandName === "design") {
        const color = interaction.options.getString("color");
        const r = parseInt(color.slice(1,3), 16);
        const g = parseInt(color.slice(3,5), 16);
        const b = parseInt(color.slice(5,7), 16);
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        const { ok } = await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تم تغيير اللون`);
        interaction.editReply(ok ? "تم تغيير اللون" : "فشل");
    }
    else if (interaction.commandName === "stats") {
        try {
            const deltaRes = await fetch("https://api.github.com/repos/Majeedl12/Majed.dev/releases");
            const releases = await deltaRes.json();
            let deltaDownloads = 0, arceusDownloads = 0;
            releases.forEach(release => {
                if (release.tag_name && release.tag_name.includes("Delta")) {
                    deltaDownloads += release.assets.reduce((sum, asset) => sum + (asset.download_count || 0), 0);
                }
                if (release.tag_name && release.tag_name.includes("Arceus")) {
                    arceusDownloads += release.assets.reduce((sum, asset) => sum + (asset.download_count || 0), 0);
                }
            });
            interaction.editReply(`DELTA: ${deltaDownloads}\nArceus Neo: ${arceusDownloads}`);
        } catch(e) {
            interaction.editReply("فشل");
        }
    }
    else if (interaction.commandName === "users") {
        const channel = interaction.options.getChannel("channel");
        interaction.editReply(`تم`);
        channel.send("يتم جلب البيانات...");
    }
});

client.login(DISCORD_TOKEN);
