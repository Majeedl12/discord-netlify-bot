import { verifyKey } from 'discord-interactions';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const SITE_ID = process.env.SITE_ID;

let currentHtml = "";

async function fetchCurrentHtml() {
    try {
        const res = await fetch(`https://${SITE_ID}.netlify.app`);
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

async function sendCallback(interactionId, token) {
    await fetch(`https://discord.com/api/v10/interactions/${interactionId}/${token}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 5 })
    });
}

async function sendFollowup(token, content) {
    await fetch(`https://discord.com/api/v10/webhooks/${process.env.DISCORD_APP_ID}/${token}/messages/@original`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const body = JSON.stringify(req.body);
    
    const isValid = verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const interaction = req.body;
    
    if (interaction.type === 1) {
        return res.status(200).json({ type: 1 });
    }

    if (interaction.type === 2) {
        await sendCallback(interaction.id, interaction.token);
        await fetchCurrentHtml();
        
        const { name, options } = interaction.data;
        
        if (name === "app") {
            const fileUrl = options[0].value;
            const fileRes = await fetch(fileUrl);
            currentHtml = await fileRes.text();
            await deployToNetlify(currentHtml);
            await sendFollowup(interaction.token, "تم");
        }
        else if (name === "version") {
            const hack = options.find(o => o.name === "hack").value;
            const status = options.find(o => o.name === "status").value;
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
            await sendFollowup(interaction.token, "تم");
        }
        else if (name === "link") {
            const hack = options.find(o => o.name === "hack").value;
            const url = options.find(o => o.name === "url").value;
            const linkPattern = /(downloadWithDelay\(event, ')(.*?)('\))/g;
            const matches = [...currentHtml.matchAll(linkPattern)];
            const idx = hack === "DELTA" ? 0 : 1;
            if (matches[idx]) {
                currentHtml = currentHtml.slice(0, matches[idx].index + 24) + url + currentHtml.slice(matches[idx].index + 24 + matches[idx][2].length);
            }
            await deployToNetlify(currentHtml);
            await sendFollowup(interaction.token, "تم");
        }
        else if (name === "design") {
            const color = options.find(o => o.name === "color").value;
            let r, g, b;
            if (color === "blue") { r=59; g=130; b=246; }
            else if (color === "green") { r=16; g=185; b=129; }
            else if (color === "red") { r=239; g=68; b=68; }
            else if (color === "purple") { r=139; g=92; b=246; }
            else { r=59; g=130; b=246; }
            
            currentHtml = currentHtml.replace(/rgb\(59,130,246\)/g, `rgb(${r},${g},${b})`);
            currentHtml = currentHtml.replace(/rgba\(59,130,246,/g, `rgba(${r},${g},${b},`);
            
            await deployToNetlify(currentHtml);
            await sendFollowup(interaction.token, "تم");
        }
        
        return res.status(200).json({ type: 5 });
    }

    return res.status(400).json({ error: 'Unknown interaction type' });
}
