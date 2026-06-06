import os
import json
import threading
import base64
import requests
import discord
from discord import app_commands
from discord.ext import commands
from flask import Flask

app = Flask('')

@app.route('/')
def home():
    return "Bot is running"

def run_web_server():
    app.run(host='0.0.0.0', port=8080)

def keep_alive():
    t = threading.Thread(target=run_web_server)
    t.start()

TOKEN = os.getenv('DISCORD_TOKEN')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO')
GITHUB_PATH = os.getenv('GITHUB_PATH', 'config.json')

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

CONFIG_FILE = 'config.json'

def load_config():
    if GITHUB_TOKEN and GITHUB_REPO:
        url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_PATH}"
        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json"
        }
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            content_b64 = r.json().get('content', '')
            content_str = base64.b64decode(content_b64).decode('utf-8')
            return json.loads(content_str)

    if not os.path.exists(CONFIG_FILE):
        return {
            "theme_color": "ازرق",
            "site_name": "هاكات - Android",
            "role_id": None,
            "delta": {"name": "DELTA", "version": "الاصدار الاخير", "link": "#", "image": "https://files.catbox.moe/oukvke.png"},
            "arceus": {"name": "Arceus Neo", "version": "الاصدار الاخير", "link": "#", "image": "https://files.catbox.moe/oukvke.png"}
        }
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_config(data):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    if GITHUB_TOKEN and GITHUB_REPO:
        url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_PATH}"
        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json"
        }
        r = requests.get(url, headers=headers)
        sha = None
        if r.status_code == 200:
            sha = r.json().get('sha')

        content_str = json.dumps(data, indent=4, ensure_ascii=False)
        content_b64 = base64.b64encode(content_str.encode('utf-8')).decode('utf-8')

        payload = {
            "message": "تحديث الإعدادات عبر بوت ديسكورد",
            "content": content_b64
        }
        if sha:
            payload["sha"] = sha

        requests.put(url, headers=headers, json=payload)

async def check_permission(interaction: discord.Interaction):
    data = load_config()
    required_role_id = data.get("role_id")
    if not required_role_id:
        return True
    user_roles = [role.id for role in interaction.user.roles]
    if required_role_id in user_roles or interaction.user.guild_permissions.administrator:
        return True
    return False

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"Bot {bot.user} is ready")

@bot.tree.command(name="android_setup", description="تحديد الرتبة المحددة التي يمكنها استخدام أوامر البوت")
@app_commands.describe(role="اختر الرتبة")
async def android_setup(interaction: discord.Interaction, role: discord.Role):
    await interaction.response.send_message("جاري معالجة الأمر...", ephemeral=True)
    data = load_config()
    data["role_id"] = role.id
    save_config(data)
    await interaction.followup.send(f"تم تحديد الرتبة بنجاح! فقط أصحاب رتبة {role.name} يمكنهم استخدام الأوامر الآن.", ephemeral=True)

@bot.tree.command(name="android_version", description="تغيير إصدار الهاك المختار")
@app_commands.choices(hack=[
    app_commands.Choice(name="DELTA", value="delta"),
    app_commands.Choice(name="Arceus Neo", value="arceus")
])
async def android_version(interaction: discord.Interaction, hack: app_commands.Choice[str], version: str):
    await interaction.response.send_message("جاري التحديث...", ephemeral=True)
    if not await check_permission(interaction):
        return await interaction.followup.send("عذراً، لا تملك الرتبة المحددة لاستخدام هذا الأمر!", ephemeral=True)
    data = load_config()
    data[hack.value]["version"] = version
    save_config(data)
    await interaction.followup.send(f"تم تغيير إصدار {hack.name} إلى: {version} بنجاح!", ephemeral=True)

@bot.tree.command(name="android_name", description="تغيير اسم الهاك المختار")
@app_commands.choices(hack=[
    app_commands.Choice(name="DELTA", value="delta"),
    app_commands.Choice(name="Arceus Neo", value="arceus")
])
async def android_name(interaction: discord.Interaction, hack: app_commands.Choice[str], new_name: str):
    await interaction.response.send_message("جاري التحديث...", ephemeral=True)
    if not await check_permission(interaction):
        return await interaction.followup.send("عذراً، لا تملك الرتبة المحددة لاستخدام هذا الأمر!", ephemeral=True)
    data = load_config()
    data[hack.value]["name"] = new_name
    save_config(data)
    await interaction.followup.send(f"تم تغيير اسم الهاك إلى: {new_name} بنجاح!", ephemeral=True)

@bot.tree.command(name="android_link", description="تغيير رابط التحميل للهاك وإرسال تحديث تلقائي للقناة")
@app_commands.choices(hack=[
    app_commands.Choice(name="DELTA", value="delta"),
    app_commands.Choice(name="Arceus Neo", value="arceus")
])
async def android_link(interaction: discord.Interaction, hack: app_commands.Choice[str], link: str):
    await interaction.response.send_message("جاري معالجة تحديث الرابط...", ephemeral=True)
    if not await check_permission(interaction):
        return await interaction.followup.send("عذراً، لا تملك الرتبة المحددة لاستخدام هذا الأمر!", ephemeral=True)
    data = load_config()
    data[hack.value]["link"] = link
    save_config(data)
    await interaction.followup.send(f"تم تحديث رابط {hack.name} بنجاح في الموقع!", ephemeral=True)
    saved_msg = data[hack.value].get("auto_message")
    saved_channel_id = data[hack.value].get("notification_channel")
    if saved_msg and saved_channel_id:
        channel = bot.get_channel(int(saved_channel_id))
        if channel:
            await channel.send(saved_msg)

@bot.tree.command(name="android_color", description="تغيير لون الثيم الخاص بالموقع")
@app_commands.choices(color=[
    app_commands.Choice(name="أزرق", value="ازرق"),
    app_commands.Choice(name="أحمر", value="احمر"),
    app_commands.Choice(name="بنفسجي", value="بنفسجي"),
    app_commands.Choice(name="أخضر", value="اخضر")
])
async def android_color(interaction: discord.Interaction, color: app_commands.Choice[str]):
    await interaction.response.send_message("جاري تغيير اللون...", ephemeral=True)
    if not await check_permission(interaction):
        return await interaction.followup.send("عذراً، لا تملك الرتبة المحددة لاستخدام هذا الأمر!", ephemeral=True)
    data = load_config()
    data["theme_color"] = color.value
    save_config(data)
    await interaction.followup.send(f"تم تغيير لون ثيم الموقع إلى ({color.name}) بنجاح!", ephemeral=True)

@bot.tree.command(name="android_message", description="إعداد رسالة التحديثات التلقائية وقناة الإرسال لكل هاك")
@app_commands.choices(hack=[
    app_commands.Choice(name="DELTA", value="delta"),
    app_commands.Choice(name="Arceus Neo", value="arceus")
])
async def android_message(interaction: discord.Interaction, hack: app_commands.Choice[str], message: str, channel: discord.TextChannel):
    await interaction.response.send_message("جاري حفظ إعدادات الإشعار التلقائي...", ephemeral=True)
    if not await check_permission(interaction):
        return await interaction.followup.send("عذراً، لا تملك الرتبة المحددة لاستخدام هذا الأمر!", ephemeral=True)
    data = load_config()
    data[hack.value]["auto_message"] = message
    data[hack.value]["notification_channel"] = channel.id
    save_config(data)
    await interaction.followup.send(f"تم الحفظ! من الآن فصاعداً، كلما قمت بتحديث رابط {hack.name}، سيقوم البوت تلقائياً بإرسال رسالتك المخصصة في قناة {channel.mention}.", ephemeral=True)

if TOKEN:
    keep_alive()
    bot.run(TOKEN)
else:
    print("Error: DISCORD_TOKEN not found in environment variables.")
