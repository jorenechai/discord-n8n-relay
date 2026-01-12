import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import http from "http";

const PORT = process.env.PORT || 3000;

/* ---- HTTP server (required for Render) ---- */
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

/* ---- Discord relay bot ---- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  try {
    await axios.post(process.env.N8N_WEBHOOK_URL, {
      content: msg.content,
      author: {
        username: msg.author.username,
        id: msg.author.id
      },
      timestamp: msg.createdAt,
      channel: msg.channel.name
    });
  } catch (err) {
    console.error("Failed to relay message:", err.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
