const { WebhookClient } = require('discord.js');
const Redis = require('ioredis');

const discordWebhook = new WebhookClient({
  id: process.env.DISCORD_WEBHOOK_ID,
  token: process.env.DISCORD_WEBHOOK_TOKEN,
});

const redis = new Redis(process.env.REDIS);

module.exports = {
  redis,
  discordWebhook,
};
