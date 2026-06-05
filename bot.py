import discord
from discord.ext import commands
import zipfile
import tempfile
import requests
import os
from pathlib import Path

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
NETLIFY_TOKEN = os.getenv("NETLIFY_TOKEN")
SITE_ID = os.getenv("SITE_ID")

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    await bot.tree.sync()

@bot.tree.command(name="app", description="Deploy to Netlify")
async def app(interaction: discord.Interaction, file: discord.Attachment):
    await interaction.response.defer(thinking=True)
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            input_path = tmp_path / file.filename
            await file.save(input_path)

            if not file.filename.endswith('.zip'):
                zip_path = tmp_path / "site.zip"
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                    zf.write(input_path, arcname=file.filename)
            else:
                zip_path = input_path

            url = f"https://api.netlify.com/api/v1/sites/{SITE_ID}/deploys"
            headers = {"Authorization": f"Bearer {NETLIFY_TOKEN}"}
            with open(zip_path, 'rb') as f:
                response = requests.post(url, headers=headers, files={'file': f})

            if response.status_code == 201:
                await interaction.followup.send(f"Deployed\nhttps://{SITE_ID}.netlify.app")
            else:
                await interaction.followup.send(f"Failed: {response.status_code}")
    except Exception as e:
        await interaction.followup.send(f"Error: {str(e)[:100]}")

bot.run(DISCORD_TOKEN)
