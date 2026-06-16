const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

const HACK_CONFIG = {
    delta: {
        name: 'DELTA',
        lineStart: '<div class="name">DELTA</div>',
        linkPattern: /https:\/\/github\.com\/Majeedl12\/Majed\.dev\/releases\/download\/Delta\/[^"]*\.apk/
    },
    arceus: {
        name: 'Arceus Neo',
        lineStart: '<div class="name">Arceus Neo</div>',
        linkPattern: /https:\/\/github\.com\/Majeedl12\/Majed\.dev\/releases\/download\/Arceus_1\/[^"]*\.apk/
    }
};

let waitingForLink = new Map();

async function getCurrentHtml() {
    try {
        const deploys = await axios.get(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
            headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
        });
        const latestDeploy = deploys.data[0];
        if (!latestDeploy) return null;
        const response = await axios.get(`${latestDeploy.ssl_url}/index.html`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    }
}

async function updateNetlify(content) {
    try {
        await axios.post(
            `https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`,
            { files: { 'index.html': content } },
            { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
        );
        return true;
    } catch (error) {
        console.error('Error updating Netlify:', error);
        return false;
    }
}

function updateHackLink(html, hackKey, newLink) {
    const config = HACK_CONFIG[hackKey];
    if (!config) return html;
    
    const lines = html.split('\n');
    let linkLineIndex = -1;
    let inHackCard = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes(config.lineStart)) {
            inHackCard = true;
            continue;
        }
        
        if (inHackCard && line.includes('download-btn') && line.includes('href')) {
            linkLineIndex = i;
            break;
        }
        
        if (inHackCard && line.includes('</div>') && line.includes('name')) {
            continue;
        }
    }
    
    if (linkLineIndex === -1) return html;
    
    lines[linkLineIndex] = lines[linkLineIndex].replace(
        config.linkPattern,
        newLink
    );
    
    return lines.join('\n');
}

function updateVersionLine(html, hackKey, newVersion) {
    const config = HACK_CONFIG[hackKey];
    if (!config) return html;
    
    const lines = html.split('\n');
    let inHackCard = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes(config.lineStart)) {
            inHackCard = true;
            continue;
        }
        
        if (inHackCard && line.includes('<div class="version">')) {
            lines[i] = line.replace(/<div class="version">[^<]*<\/div>/, `<div class="version">${newVersion}</div>`);
            break;
        }
        
        if (inHackCard && line.includes('</div>') && line.includes('name')) {
            continue;
        }
    }
    
    return lines.join('\n');
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content !== '!android') return;

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('اختر الهاك')
        .setDescription('اختر الهاك الذي تريد تحديث رابط تحميله');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('delta')
                .setLabel('DELTA')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('arceus')
                .setLabel('Arceus Neo')
                .setStyle(ButtonStyle.Primary)
        );

    await message.reply({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const hackKey = interaction.customId;
    const hackName = HACK_CONFIG[hackKey].name;

    waitingForLink.set(interaction.user.id, hackKey);

    await interaction.reply({ 
        content: `✅ اخترت ${hackName}\n📎 الرجاء ارسال رابط التحميل الجديد`, 
        ephemeral: true 
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    const hackKey = waitingForLink.get(message.author.id);
    if (!hackKey) return;

    const newLink = message.content.trim();
    
    if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
        return message.reply('❌ الرجاء ارسال رابط صحيح يبدأ بـ http:// أو https://');
    }

    try {
        let html = await getCurrentHtml();
        if (!html) {
            return message.reply('❌ لم يتم العثور على الملف');
        }

        html = updateHackLink(html, hackKey, newLink);
        html = updateVersionLine(html, hackKey, 'الاصدار الاخير');

        const success = await updateNetlify(html);
        if (!success) {
            return message.reply('❌ فشل تحديث الملف');
        }

        waitingForLink.delete(message.author.id);
        await message.reply(`✅ تم تحديث رابط ${HACK_CONFIG[hackKey].name}\n📎 الرابط الجديد: ${newLink}`);
        
    } catch (error) {
        console.error(error);
        await message.reply('❌ حدث خطأ أثناء التحديث');
    }
});

client.login(token);
