const dotenv = require('dotenv');
dotenv.config();
const { request } = require('graphql-request');
const { redis, discordWebhook } = require('./clients');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const {
  setupUpcomingAuctions,
  setupOpenAuctions,
  setupVotingAuctions,
  setupClosedAuctions,
  setupProposals,
  setupVotings,
  setupSettings,
} = require('./setup');
const {
  upcomingAuctionsQuery,
  openAuctionsQuery,
  votingAuctionsQuery,
  closedAuctionsQuery,
  proposalsQuery,
  votingsQuery,
} = require('./query');
const {
  getUpcomingAuctionsCacheKey,
  getOpenAuctionsCacheKey,
  getVotingAuctionsCacheKey,
  getClosedAuctionsCacheKey,
  getProposalsCacheKey,
  getVotingsCacheKey,
  getSettingsCacheKey,
} = require('./cache');
const { nameToSlug } = require('./utils');

// Upcoming Auctions
async function processUpcomingAuctionsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, upcomingAuctionsQuery());

  const upcomingAuctionsCache = JSON.parse(await redis.get(getUpcomingAuctionsCacheKey));
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  let changed = false;

  for (auction of auctionsByStatus) {
    let found = false;
    upcomingAuctionsCache.forEach(auctionCache => {
      if (auction.id === auctionCache.id) found = true;
    });
    if (!found) {
      changed = true;
      const embed = new EmbedBuilder()
        .setTitle('New Upcoming Auction')
        .setDescription(`**${auction.title}**\n${auction.description}`)
        .setURL(
          `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(auction.title)}`,
        )
        .addFields(
          {
            name: 'Community',
            value: `[${auction.community.name}](https://prop.house/${nameToSlug(
              auction.community.name,
            )})`,
            inline: true,
          },
          {
            name: 'Funding Amount',
            value: `${auction.fundingAmount} ${auction.currencyType}`,
            inline: true,
          },
        )
        .setTimestamp();

      const setting = settingsCache.find(item => item.id == auction.community.id);

      if (setting) {
        const communityWebhook = new WebhookClient({
          id: setting.webhook_id,
          token: setting.webhook_token,
        });
        try {
          communityWebhook.send({
            username: 'Prop House BOT',
            avatarURL: 'https://prop.house/bulb.png',
            embeds: [embed],
          });
        } catch (e) {
          console.log(e.message);
        }
      }

      discordWebhook.send({
        username: 'Prop House BOT',
        avatarURL: 'https://prop.house/bulb.png',
        embeds: [embed],
      });
      console.log(
        `New upcoming auction ${auction.id}/${auction.title} from ${auction.community.name}`,
      );
    }
  }

  if (changed) await redis.set(getUpcomingAuctionsCacheKey, JSON.stringify(auctionsByStatus));
}

// Open Auctions
async function processOpenAuctionsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, openAuctionsQuery());

  const openAuctionsCache = JSON.parse(await redis.get(getOpenAuctionsCacheKey));
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  let changed = false;

  for (auction of auctionsByStatus) {
    let found = false;
    openAuctionsCache.forEach(auctionCache => {
      if (auction.id === auctionCache.id) found = true;
    });
    if (!found) {
      changed = true;
      const embed = new EmbedBuilder()
        .setTitle('New Open Auction')
        .setDescription(`**${auction.title}**\n${auction.description}`)
        .setURL(
          `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(auction.title)}`,
        )
        .addFields(
          {
            name: 'Community',
            value: `[${auction.community.name}](https://prop.house/${nameToSlug(
              auction.community.name,
            )})`,
            inline: true,
          },
          {
            name: 'Funding Amount',
            value: `${auction.fundingAmount} ${auction.currencyType}`,
            inline: true,
          },
          {
            name: 'Link',
            value: `[Propose here](https://prop.house/${nameToSlug(
              auction.community.name,
            )}/${nameToSlug(auction.title)})`,
            inline: true,
          },
        )
        .setTimestamp();

      const setting = settingsCache.find(item => item.id == auction.community.id);

      if (setting) {
        const communityWebhook = new WebhookClient({
          id: setting.webhook_id,
          token: setting.webhook_token,
        });
        try {
          communityWebhook.send({
            username: 'Prop House BOT',
            avatarURL: 'https://prop.house/bulb.png',
            embeds: [embed],
          });
        } catch (e) {
          console.log(e.message);
        }
      }

      discordWebhook.send({
        username: 'Prop House BOT',
        avatarURL: 'https://prop.house/bulb.png',
        embeds: [embed],
      });
      console.log(`New open auction ${auction.id}/${auction.title} from ${auction.community.name}`);
    }
  }

  if (changed) await redis.set(getOpenAuctionsCacheKey, JSON.stringify(auctionsByStatus));
}

// Voting Auctions
async function processVotingAuctionsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, votingAuctionsQuery());

  const votingAuctionsCache = JSON.parse(await redis.get(getVotingAuctionsCacheKey));
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  let changed = false;

  for (auction of auctionsByStatus) {
    let found = false;
    votingAuctionsCache.forEach(auctionCache => {
      if (auction.id === auctionCache.id) found = true;
    });
    if (!found) {
      changed = true;
      const embed = new EmbedBuilder()
        .setTitle('New Voting Auction')
        .setDescription(`**${auction.title}**\n${auction.description}`)
        .setURL(
          `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(auction.title)}`,
        )
        .addFields(
          {
            name: 'Community',
            value: `[${auction.community.name}](https://prop.house/${nameToSlug(
              auction.community.name,
            )})`,
            inline: true,
          },
          {
            name: 'Funding Amount',
            value: `${auction.fundingAmount} ${auction.currencyType}`,
            inline: true,
          },
          {
            name: 'Link',
            value: `[Vote here](https://prop.house/${nameToSlug(
              auction.community.name,
            )}/${nameToSlug(auction.title)})`,
            inline: true,
          },
        )
        .setTimestamp();

      const setting = settingsCache.find(item => item.id == auction.community.id);

      if (setting) {
        const communityWebhook = new WebhookClient({
          id: setting.webhook_id,
          token: setting.webhook_token,
        });
        try {
          communityWebhook.send({
            username: 'Prop House BOT',
            avatarURL: 'https://prop.house/bulb.png',
            embeds: [embed],
          });
        } catch (e) {
          console.log(e.message);
        }
      }

      discordWebhook.send({
        username: 'Prop House BOT',
        avatarURL: 'https://prop.house/bulb.png',
        embeds: [embed],
      });
      console.log(
        `New voting auction ${auction.id}/${auction.title} from ${auction.community.name}`,
      );
    }
  }

  if (changed) await redis.set(getVotingAuctionsCacheKey, JSON.stringify(auctionsByStatus));
}

// Closed Auctions
async function processClosedAuctionsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, closedAuctionsQuery());

  const closedAuctionsCache = JSON.parse(await redis.get(getClosedAuctionsCacheKey));
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  let changed = false;

  for (auction of auctionsByStatus) {
    let found = false;
    closedAuctionsCache.forEach(auctionCache => {
      if (auction.id === auctionCache.id) found = true;
    });
    // if found
    if (found) continue;

    changed = true;

    console.log(
      `New closed auction ${auction.id}/${auction.title} from ${auction.community.name} with winners:`,
    );

    const winners = [];
    //numWinners = 0
    auction.proposals
      .slice()
      .sort((a, b) => (Number(a.voteCount) < Number(b.voteCount) ? 1 : -1))
      .slice(0, auction.numWinners)
      .map(p => winners.push({ title: p.title, tldr: p.tldr, voteCount: p.voteCount }));

    let descriptions = '';

    for (let i in winners) {
      const text = `**#${parseInt(i) + 1}**\n**${winners[i].title}**\nTotal vote: ${
        winners[i].voteCount
      }\n${winners[i].tldr}\n\n`;
      console.log(text);

      descriptions = descriptions + text;
    }

    const embed = new EmbedBuilder()
      .setTitle('New Closed Auction')
      .setDescription(`**${auction.title} Winners**\n${descriptions}`)
      .setURL(
        `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(auction.title)}`,
      )
      .addFields(
        {
          name: 'Community',
          value: `[${auction.community.name}](https://prop.house/${nameToSlug(
            auction.community.name,
          )})`,
          inline: true,
        },
        {
          name: 'Funding Amount',
          value: `${auction.fundingAmount} ${auction.currencyType}`,
          inline: true,
        },
        {
          name: 'Link',
          value: `[See the winners](https://prop.house/${nameToSlug(
            auction.community.name,
          )}/${nameToSlug(auction.title)})`,
          inline: true,
        },
      )
      .setTimestamp();

    const setting = settingsCache.find(item => item.id == auction.community.id);

    if (setting) {
      const communityWebhook = new WebhookClient({
        id: setting.webhook_id,
        token: setting.webhook_token,
      });

      communityWebhook.send({
        username: 'Prop House BOT',
        avatarURL: 'https://prop.house/bulb.png',
        embeds: [embed],
      });
    }

    discordWebhook.send({
      username: 'Prop House BOT',
      avatarURL: 'https://prop.house/bulb.png',
      embeds: [embed],
    });
  }

  if (changed) await redis.set(getClosedAuctionsCacheKey, JSON.stringify(auctionsByStatus));
}

// Proposals
async function processProposalsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, proposalsQuery());

  const auctionsCache = JSON.parse(await redis.get(getProposalsCacheKey));
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  let changed = false;

  for (auction of auctionsByStatus) {
    const index = auctionsCache.findIndex(x => x.id === auction.id);

    let proposalsCache = [];
    if (index > -1) proposalsCache = auctionsCache[index].proposals;

    const { proposals } = auction;

    proposals.forEach(proposal => {
      let found = false;
      proposalsCache.forEach(proposalCache => {
        if (proposal.id === proposalCache.id) found = true;
      });
      if (!found) {
        changed = true;
        const embed = new EmbedBuilder()
          .setTitle('New Proposal')
          .setDescription(`**${proposal.title}**\n\n${proposal.tldr}`)
          .setURL(
            `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(
              auction.title,
            )}/${proposal.id}`,
          )
          .addFields(
            {
              name: 'Community',
              value: `[${auction.community.name}](https://prop.house/${nameToSlug(
                auction.community.name,
              )})`,
              inline: true,
            },
            {
              name: 'Auction',
              value: `[${auction.title}](https://prop.house/${nameToSlug(
                auction.community.name,
              )}/${nameToSlug(auction.title)})`,
              inline: true,
            },
            {
              name: 'Link',
              value: `[Read full here](https://prop.house/${nameToSlug(
                auction.community.name,
              )}/${nameToSlug(auction.title)}/${proposal.id})`,
              inline: true,
            },
          )
          .setTimestamp();

        const setting = settingsCache.find(item => item.id == auction.community.id);

        if (setting) {
          const communityWebhook = new WebhookClient({
            id: setting.webhook_id,
            token: setting.webhook_token,
          });

          communityWebhook.send({
            username: 'Prop House BOT',
            avatarURL: 'https://prop.house/bulb.png',
            embeds: [embed],
          });
        }

        discordWebhook.send({
          username: 'Prop House BOT',
          avatarURL: 'https://prop.house/bulb.png',
          embeds: [embed],
        });
        console.log(
          `New proposal ${proposal.title} / ${proposal.tldr} on ${auction.id}/${auction.title} from ${auction.community.name}`,
        );
      }
    });
  }

  if (changed) await redis.set(getProposalsCacheKey, JSON.stringify(auctionsByStatus));
}

// Votings
async function processVotingsTick() {
  const { auctionsByStatus } = await request(process.env.GRAPHQL_API_URL, votingsQuery());
  const settingsCache = JSON.parse(await redis.get(getSettingsCacheKey));

  for (let auction of auctionsByStatus) {
    const { proposals } = auction;

    console.log(`Voting update ${auction.id}/${auction.title} from ${auction.community.name}`);
    const winners = [];
    //numWinners = 0
    proposals
      .slice()
      .sort((a, b) => (Number(a.voteCount) < Number(b.voteCount) ? 1 : -1))
      .slice(0, auction.numWinners)
      .map(p => winners.push({ title: p.title, tldr: p.tldr, voteCount: p.voteCount }));

    let descriptions = '';

    for (let i in winners) {
      const text = `**#${parseInt(i) + 1}**\n**${winners[i].title}**\nTotal vote: ${
        winners[i].voteCount
      }\n${winners[i].tldr}\n\n`;
      console.log(text);

      descriptions = descriptions + text;
    }

    const embed = new EmbedBuilder()
      .setTitle('Voting Leaderboard Update')
      .setDescription(`**${auction.title} Leaderboard**\n${descriptions}`)
      .setURL(
        `https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(auction.title)}`,
      )
      .addFields(
        {
          name: 'Community',
          value: `[${auction.community.name}](https://prop.house/${nameToSlug(
            auction.community.name,
          )})`,
          inline: true,
        },
        {
          name: 'Voting ends',
          value: `<t:${moment(auction.votingEndTime).unix()}>`,
          inline: true,
        },
        {
          name: 'Funding Amount',
          value: `${auction.fundingAmount} ${auction.currencyType}`,
          inline: true,
        },
        {
          name: 'Link',
          value: `[Vote here](https://prop.house/${nameToSlug(auction.community.name)}/${nameToSlug(
            auction.title,
          )})`,
          inline: true,
        },
      )
      .setTimestamp();

    const setting = settingsCache.find(item => item.id == auction.community.id);

    if (setting) {
      const communityWebhook = new WebhookClient({
        id: setting.webhook_id,
        token: setting.webhook_token,
      });

      communityWebhook.send({
        username: 'Prop House BOT',
        avatarURL: 'https://prop.house/bulb.png',
        embeds: [embed],
      });
    }

    discordWebhook.send({
      username: 'Prop House BOT',
      avatarURL: 'https://prop.house/bulb.png',
      embeds: [embed],
    });
  }

  await redis.set(getVotingsCacheKey, JSON.stringify(auctionsByStatus));
}

// setup
setupUpcomingAuctions().then(() => 'setupUpcomingAuctions');
setupOpenAuctions().then(() => 'setupOpenAuctions');
setupVotingAuctions().then(() => 'setupVotingAuctions');
setupClosedAuctions().then(() => 'setupClosedAuctions');
setupProposals().then(() => 'setupProposals');
setupVotings().then(() => 'setupVotings');
setupSettings().then(() => 'setupSettings');

//run first
processUpcomingAuctionsTick();
processOpenAuctionsTick();
processVotingAuctionsTick();
processClosedAuctionsTick();
processProposalsTick();
//processVotingsTick();

//schedule
setInterval(async () => processUpcomingAuctionsTick(), 60000);
setInterval(async () => processOpenAuctionsTick(), 60000);
setInterval(async () => processVotingAuctionsTick(), 60000);
setInterval(async () => processClosedAuctionsTick(), 60000);
setInterval(async () => processProposalsTick(), 60000);
setInterval(async () => processVotingsTick(), 60000 * 60 * 12); // 1 hours
