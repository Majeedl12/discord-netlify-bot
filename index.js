import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function deployToNetlify(content) {
    const sha1 = createHash("sha1").update(content).digest("hex");
    const createRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "/index.html": sha1 } })
    });
    if (!createRes.ok) return { ok: false, msg: `Create failed: ${createRes.status}` };
    const { id: deployId } = await createRes.json();
    const uploadRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}/files/index.html`, {
        method: "PUT", headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }, body: content
    });
    if (!uploadRes.ok) return { ok: false, msg: `Upload failed: ${uploadRes.status}` };
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const statusRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
            headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }
        });
        if (statusRes.ok) {
            const { state } = await statusRes.json();
            if (state === "ready") return { ok: true, msg: "Published" };
            if (state === "error") return { ok: false, msg: "Deploy errored" };
        }
    }
    return { ok: false, msg: "Timeout" };
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
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
                    { type: 3, name: "status", description: "الحالة الجديدة", required: true, choices: [{ name: "الاصدار الاخير", value: "الاصدار الاخير" }, { name: "يوجد تحديث", value: "يوجد تحديث" }] }
                ]
            },
            {
                name: "link",
                description: "تغيير رابط التحميل",
                options: [
                    { type: 3, name: "hack", description: "DELTA or Arceus Neo", required: true, choices: [{ name: "DELTA", value: "DELTA" }, { name: "Arceus Neo", value: "Arceus Neo" }] },
                    { type: 3, name: "url", description: "الرابط الجديد", required: true }
                ]
            }
        ]
    });
    console.log("Commands registered");
});

let currentHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>هاكات - Android</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;user-select:none;}
body{background:#000;color:#fff;font-family:'Cairo',sans-serif;display:flex;justify-content:center;padding:30px 20px;}
.card{background:rgba(5,5,5,0.7);border:1px solid rgba(59,130,246,0.2);border-radius:24px;padding:35px 30px;text-align:center;width:100%;max-width:550px;}
.name{font-size:28px;font-weight:900;margin-bottom:2px;}
.version{font-size:14px;font-weight:600;color:rgba(59,130,246,0.6);margin-bottom:5px;}
.download-btn{width:100%;padding:14px;background:rgba(5,5,5,0.4);border-radius:12px;text-decoration:none;margin-top:20px;display:block;color:#fff;border:1px solid rgba(59,130,246,0.25);}
.section-title{font-size:32px;font-weight:900;margin-bottom:35px;}
.cards-grid{display:flex;gap:40px;flex-wrap:wrap;justify-content:center;}
</style>
</head>
<body>
<div class="main-container">
<div class="section-title">هاكات - Android</div>
<div class="cards-grid">
<div class="card"><div class="name">DELTA</div><div class="version">الاصدار الاخير</div><a href="#" onclick="setTimeout(()=>window.open('https://github.com/Majeedl12/Majed.dev/releases/download/Delta/Delta-2.721.1108.apk','_blank'),1000);return false;" class="download-btn">تثبيت</a></div>
<div class="card"><div class="name">Arceus Neo</div><div class="version">الاصدار الاخير</div><a href="#" onclick="setTimeout(()=>window.open('https://github.com/Majeedl12/Majed.dev/releases/download/Arceus_1/Roblox.Arceus.X.NEO.2.2.2.apk','_blank'),1000);return false;" class="download-btn">تثبيت</a></div>
</div></div></body></html>`;

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    await interaction.deferReply();
    if (interaction.commandName === "app") {
        const file = interaction.options.getAttachment("file");
        if (!file || !file.name.endsWith(".html")) return interaction.followUp("يرجى رفع ملف html");
        const res = await fetch(file.url);
        currentHtml = await res.text();
        const { ok, msg } = await deployToNetlify(currentHtml);
        interaction.followUp(ok ? `تم النشر\nhttps://${SITE_ID}.netlify.app` : `فشل: ${msg}`);
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
        const { ok, msg } = await deployToNetlify(currentHtml);
        interaction.followUp(ok ? `تم تغيير حالة ${hack} إلى ${status}` : `فشل: ${msg}`);
    }
    else if (interaction.commandName === "link") {
        const hack = interaction.options.getString("hack");
        const url = interaction.options.getString("url");
        const linkPattern = /(window\.open\(')(.*?)('\))/g;
        const matches = [...currentHtml.matchAll(linkPattern)];
        const idx = hack === "DELTA" ? 0 : 1;
        if (matches[idx]) {
            currentHtml = currentHtml.slice(0, matches[idx].index + 13) + url + currentHtml.slice(matches[idx].index + 13 + matches[idx][2].length);
        }
        const { ok, msg } = await deployToNetlify(currentHtml);
        interaction.followUp(ok ? `تم تغيير رابط ${hack} إلى ${url}` : `فشل: ${msg}`);
    }
});

client.login(DISCORD_TOKEN);
