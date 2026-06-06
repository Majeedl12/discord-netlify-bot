const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
const crypto = require('crypto');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

let currentHtml = '';

async function fetchCurrentHtml() {
    try {
        const res = await fetch(`https://${SITE_ID}.netlify.app`);
        if (res.ok) currentHtml = await res.text();
    } catch (e) {}
}

async function deployToNetlify(content) {
    try {
        const sha1 = crypto.createHash('sha1').update(content).digest('hex');
        const createRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: { '/index.html': sha1 } })
        });
        if (!createRes.ok) return false;
        const { id: deployId } = await createRes.json();
        const uploadRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}/files/index.html`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` },
            body: content
        });
        return uploadRes.ok;
    } catch (e) {
        return false;
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const commands = [
        {
            name: 'app',
            description: 'رفع ملف HTML',
            options: [{ type: 11, name: 'file', description: 'الملف', required: true }]
        },
        {
            name: 'version',
            description: 'تغيير حالة الهاك',
            options: [
                { type: 3, name: 'hack', description: 'الهاك', required: true, choices: [{ name: 'DELTA', value: 'DELTA' }, { name: 'Arceus Neo', value: 'Arceus Neo' }] },
                { type: 3, name: 'status', description: 'الحالة', required: true, choices: [{ name: 'الاصدار الاخير', value: 'الاصدار الاخير' }, { name: 'يوجد تحديث', value: 'يوجد تحديث' }] }
            ]
        },
        {
            name: 'link',
            description: 'تغيير رابط التحميل',
            options: [
                { type: 3, name: 'hack', description: 'الهاك', required: true, choices: [{ name: 'DELTA', value: 'DELTA' }, { name: 'Arceus Neo', value: 'Arceus Neo' }] },
                { type: 3, name: 'url', description: 'الرابط', required: true }
            ]
        },
        {
            name: 'design',
            description: 'تغيير لون الموقع',
            options: [
                { type: 3, name: 'color', description: 'اللون', required: true, choices: [
                    { name: 'ازرق', value: 'blue' }, { name: 'اخضر', value: 'green' },
                    { name: 'احمر', value: 'red' }, { name: 'بنفسجي', value: 'purple' }
                ]}
            ]
        }
    ];
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    await fetchCurrentHtml();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    await interaction.deferReply();
    
    await fetchCurrentHtml();
    
    try {
        if (interaction.commandName === 'app') {
            const file = interaction.options.getAttachment('file');
            if (!file || !file.name.endsWith('.html')) {
                await interaction.editReply('ارفع ملف html');
                return;
            }
            const res = await fetch(file.url);
            currentHtml = await res.text();
            await deployToNetlify(currentHtml);
            await interaction.editReply('تم');
        }
        else if (interaction.commandName === 'version') {
            const hack = interaction.options.getString('hack');
            const status = interaction.options.getString('status');
            if (hack === 'DELTA') {
                currentHtml = currentHtml.replace(/<div class="version">الاصدار الاخير<\/div>/, `<div class="version">${status}</div>`);
            } else {
                let replaced = false;
                currentHtml = currentHtml.replace(/<div class="version">الاصدار الاخير<\/div>/g, match => replaced ? match : (replaced = true, `<div class="version">${status}</div>`));
            }
            await deployToNetlify(currentHtml);
            await interaction.editReply('تم');
        }
        else if (interaction.commandName === 'link') {
            const hack = interaction.options.getString('hack');
            const url = interaction.options.getString('url');
            const regex = /downloadWithDelay\(event, '([^']+)'\)/g;
            const matches = [...currentHtml.matchAll(regex)];
            const idx = hack === 'DELTA' ? 0 : 1;
            if (matches[idx]) {
                currentHtml = currentHtml.replace(matches[idx][0], `downloadWithDelay(event, '${url}')`);
            }
            await deployToNetlify(currentHtml);
            await interaction.editReply('تم');
        }
        else if (interaction.commandName === 'design') {
            const color = interaction.options.getString('color');
            let r, g, b;
            if (color === 'blue') { r=59; g=130; b=246; }
            else if (color === 'green') { r=16; g=185; b=129; }
            else if (color === 'red') { r=239; g=68; b=68; }
            else if (color === 'purple') { r=139; g=92; b=246; }
            else { r=59; g=130; b=246; }
            currentHtml = currentHtml.replace(/rgba\(59,130,246,/g, `rgba(${r},${g},${b},`);
            await deployToNetlify(currentHtml);
            await interaction.editReply('تم');
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply('خطأ');
    }
});

client.login(DISCORD_TOKEN);
