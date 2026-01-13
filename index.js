import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import http from "http";

/* ---- Render health check server ---- */
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

console.log("BOT PROCESS STARTED");

/* ---- Discord relay bot ---- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- Ensure environment variables are set ---
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
let N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

if (!DISCORD_TOKEN || !N8N_WEBHOOK_URL) {
  console.error("ERROR: DISCORD_BOT_TOKEN or N8N_WEBHOOK_URL not set");
  process.exit(1);
}

// --- Remove accidental trailing whitespace / newlines from webhook URL
N8N_WEBHOOK_URL = N8N_WEBHOOK_URL.trim();

client.once("ready", () => {
  console.log(`BOT LOGGED IN AS: ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  // Ignore messages from bots
  if (msg.author.bot) return;

  // Optional: only forward messages starting with "/expense"
  if (!msg.content.toLowerCase().startsWith("/expense")) return;

  const payload = {
    content: msg.content,
    author: {
      username: msg.author.username,
      id: msg.author.id
    },
    timestamp: msg.createdAt,
    channel: msg.channel.name
  };

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    console.log(`Forwarded message from ${msg.author.username}`);
  } catch (err) {
    console.error("Failed to relay message:", err.response?.status, err.message);
  }
});

// --- Login to Discord ---
client.login(DISCORD_TOKEN);
