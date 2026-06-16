const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

const HACK_CONFIG = {
    delta: {
        name: 'DELTA',
        img: 'https://deltaexploits.gg/assets/android.webp',
        lineStart: '<div class="name">DELTA</div>',
        linkPattern: /https:\/\/github\.com\/Majeedl12\/Majed\.dev\/releases\/download\/Delta\/[^"]*\.apk/
    },
    arceus: {
        name: 'Arceus Neo',
        img: 'https://techylist.com/wp-content/uploads/2022/11/arceus-x-first.jpeg',
        lineStart: '<div class="name">Arceus Neo</div>',
        linkPattern: /https:\/\/github\.com\/Majeedl12\/Majed\.dev\/releases\/download\/Arceus_1\/[^"]*\.apk/
    }
};

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

const commands = [
    new SlashCommandBuilder()
        .setName('update')
        .setDescription('تحديث روابط تحميل الهاكات')
        .addStringOption(option => 
            option.setName('hack')
                .setDescription('اختر الهاك')
                .setRequired(true)
                .addChoices(
                    { name: 'DELTA', value: 'delta' },
                    { name: 'Arceus Neo', value: 'arceus' }
                ))
        .addStringOption(option => 
            option.setName('link')
                .setDescription('رابط التحميل الجديد')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('version')
                .setDescription('الاصدار الجديد')
                .setRequired(true))
];

client.once('ready', async () => {
    console.log(`شغال كـ ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('تم تسجيل الأوامر');
    } catch (error) {
        console.error('خطأ:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'update') return;

    await interaction.deferReply({ ephemeral: true });

    const hackKey = interaction.options.getString('hack');
    const newLink = interaction.options.getString('link');
    const newVersion = interaction.options.getString('version');

    try {
        let html = await getCurrentHtml();
        if (!html) {
            return interaction.editReply({ content: '❌ لم يتم العثور على الملف الحالي', ephemeral: true });
        }

        html = updateHackLink(html, hackKey, newLink);
        html = updateVersionLine(html, hackKey, newVersion);

        const success = await updateNetlify(html);
        if (!success) {
            return interaction.editReply({ content: '❌ فشل تحديث الملف على Netlify', ephemeral: true });
        }

        const hackName = HACK_CONFIG[hackKey].name;
        await interaction.editReply({ content: `✅ تم تحديث ${hackName}\n📎 الرابط الجديد: ${newLink}\n📌 الاصدار: ${newVersion}`, ephemeral: true });
        
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء تحديث الرابط', ephemeral: true });
    }
});

client.login(token);
