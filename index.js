import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";

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
