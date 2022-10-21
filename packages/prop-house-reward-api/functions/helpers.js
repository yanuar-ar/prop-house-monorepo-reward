const { request, gql } = require('graphql-request');

const auctionQuery = id => gql`
  {
    auction(id: ${id}) {
      id
      numWinners
      status
      community {
        name
        id
    }
      proposals {
        address
        voteCount
        id
      }
    }
  }
`;

const voteQuery = id => gql`
  {
    auction(id: ${id}) {
      proposals {
        votes {
          address
          weight
        }
        id
      }
      id
      community {
        name
          id
      }
      status
    }
  }
`;

const checkWinner = async (id, address) => {
  const { auction } = await request(process.env.GRAPHQL_URL, auctionQuery(id));
  const { proposals, status, community } = auction;

  const winners = [];

  // calculate winners
  proposals
    .slice()
    .sort((a, b) => (Number(a.voteCount) < Number(b.voteCount) ? 1 : -1))
    .slice(0, auction.numWinners)
    .map(p => winners.push(p.address));

  // only community =1
  let winner = false;
  if (status == 'Closed' && community.id == 1) {
    winners.includes(address);
  }

  return {
    id: id,
    address: address,
    winner: winner,
  };
};

const checkVoter = async (id, address) => {
  const { auction } = await request(process.env.GRAPHQL_URL, voteQuery(id));
  const { proposals, status, community } = auction;

  let voter = false;
  let weight = 0;
  for (let proposal of proposals) {
    const { votes } = proposal;
    votes.forEach(vote => {
      if (vote.address === address) weight += vote.weight;
    });
  }

  // if weight > 0
  if (weight > 0) voter = true;

  // only community =1
  if (status !== 'Closed' || community.id !== 1) {
    voter = false;
  }

  return {
    id: id,
    address: address,
    voter: voter,
  };
};

// allow CORS
const headers = {
  'Content-Type': 'application/json; charset=utf-8', //optional
  'Access-Control-Allow-Origin': '*',
};

exports.checkWinner = checkWinner;
exports.checkVoter = checkVoter;
exports.headers = headers;
