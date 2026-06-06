import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let updateLogs = [];
let currentHtml = "";

async function fetchCurrentHtml() {
    try {
        const siteUrl = `https://${SITE_ID}.netlify.app`;
        const res = await fetch(siteUrl);
        if (res.ok) {
            currentHtml = await res.text();
            return true;
        }
    } catch (e) {}
    return false;
}

async function deployToNetlify(content) {
    const sha1 = createHash("sha1").update(content).digest("hex");
    const createRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "/index.html": sha1 } })
    });
    if (!createRes.ok) return false;
    const { id: deployId } = await createRes.json();
    const uploadRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}/files/index.html`, {
        method: "PUT", headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }, body: content
    });
    if (!uploadRes.ok) return false;
    return true;
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await fetchCurrentHtml();
    
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
                        { name: "ازرق", value: "blue" },
                        { name: "اخضر", value: "green" },
                        { name: "احمر", value: "red" },
                        { name: "بنفسجي", value: "purple" }
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
    await fetchCurrentHtml();
    
    if (interaction.commandName === "app") {
        const file = interaction.options.getAttachment("file");
        if (!file || !file.name.endsWith(".html")) return interaction.editReply("ارفع ملف html");
        const res = await fetch(file.url);
        currentHtml = await res.text();
        await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] رفع ملف`);
        interaction.editReply("تم");
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
        await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تغيير حالة ${hack}`);
        interaction.editReply("تم");
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
        await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تغيير رابط ${hack}`);
        interaction.editReply("تم");
    }
    else if (interaction.commandName === "announce") {
        const channel = interaction.options.getChannel("channel");
        const message = interaction.options.getString("message");
        if (!channel.isTextBased()) return interaction.editReply("خطا");
        await channel.send(message);
        interaction.editReply("تم");
    }
    else if (interaction.commandName === "logs") {
        if (updateLogs.length === 0) return interaction.editReply("لا يوجد");
        interaction.editReply(updateLogs.slice(-10).reverse().join("\n"));
    }
    else if (interaction.commandName === "design") {
        const color = interaction.options.getString("color");
        let r, g, b;
        if (color === "blue") { r=59; g=130; b=246; }
        else if (color === "green") { r=16; g=185; b=129; }
        else if (color === "red") { r=239; g=68; b=68; }
        else if (color === "purple") { r=139; g=92; b=246; }
        else { r=59; g=130; b=246; }
        
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        currentHtml = currentHtml.replace(/rgba\(59,130,246/g, `rgba(${r},${g},${b}`);
        
        await deployToNetlify(currentHtml);
        updateLogs.push(`[${new Date().toLocaleString()}] تغيير اللون`);
        interaction.editReply("تم تغيير اللون");
    }
    else if (interaction.commandName === "stats") {
        try {
            const res = await fetch("https://api.github.com/repos/Majeedl12/Majed.dev/releases");
            const releases = await res.json();
            let delta = 0, arceus = 0;
            releases.forEach(release => {
                if (release.tag_name && release.tag_name.includes("Delta")) {
                    delta += release.assets.reduce((s, a) => s + (a.download_count || 0), 0);
                }
                if (release.tag_name && release.tag_name.includes("Arceus")) {
                    arceus += release.assets.reduce((s, a) => s + (a.download_count || 0), 0);
                }
            });
            interaction.editReply(`Delta: ${delta}\nArceus Neo: ${arceus}`);
        } catch(e) {
            interaction.editReply("فشل");
        }
    }
    else if (interaction.commandName === "users") {
        const channel = interaction.options.getChannel("channel");
        interaction.editReply("تم");
        channel.send("جاري جلب البيانات...");
    }
});

client.login(DISCORD_TOKEN);
