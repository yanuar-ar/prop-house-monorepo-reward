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

// allow CORS
const headers = {
  'Content-Type': 'application/json; charset=utf-8', //optional
  'Access-Control-Allow-Origin': '*',
};

exports.checkWinner = checkWinner;
exports.headers = headers;
