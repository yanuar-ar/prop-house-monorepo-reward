const { redis } = require('./clients');
const {
  getUpcomingAuctionsCacheKey,
  getOpenAuctionsCacheKey,
  getVotingAuctionsCacheKey,
  getClosedAuctionsCacheKey,
  getProposalsCacheKey,
  getVotingsCacheKey,
  getSettingsCacheKey,
} = require('./cache');

async function setupUpcomingAuctions() {
  const exists = await redis.exists(getUpcomingAuctionsCacheKey);
  if (exists === 0) await redis.set(getUpcomingAuctionsCacheKey, JSON.stringify([]));
}

async function setupOpenAuctions() {
  const exists = await redis.exists(getOpenAuctionsCacheKey);
  if (exists === 0) await redis.set(getOpenAuctionsCacheKey, JSON.stringify([]));
}

async function setupVotingAuctions() {
  const exists = await redis.exists(getVotingAuctionsCacheKey);
  if (exists === 0) await redis.set(getVotingAuctionsCacheKey, JSON.stringify([]));
}

async function setupClosedAuctions() {
  const exists = await redis.exists(getClosedAuctionsCacheKey);
  if (exists === 0) await redis.set(getClosedAuctionsCacheKey, JSON.stringify([]));
}

async function setupProposals() {
  const exists = await redis.exists(getProposalsCacheKey);
  if (exists === 0) await redis.set(getProposalsCacheKey, JSON.stringify([]));
}

async function setupVotings() {
  const exists = await redis.exists(getVotingsCacheKey);
  if (exists === 0) await redis.set(getVotingsCacheKey, JSON.stringify([]));
}

async function setupSettings() {
  const exists = await redis.exists(getSettingsCacheKey);
  if (exists === 0) await redis.set(getSettingsCacheKey, JSON.stringify([]));
}

module.exports = {
  setupUpcomingAuctions,
  setupOpenAuctions,
  setupVotingAuctions,
  setupClosedAuctions,
  setupProposals,
  setupVotings,
  setupSettings,
};
