const { request, gql } = require('graphql-request');

const auctionQuery = id => gql`
  {
    auction(id: ${id}) {
      id
      numWinners
      status
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
  const { proposals } = auction;

  const winners = [];

  // calculate winners
  proposals
    .slice()
    .sort((a, b) => (Number(a.voteCount) < Number(b.voteCount) ? 1 : -1))
    .slice(0, auction.numWinners)
    .map(p => winners.push(p.address));

  return {
    id: id,
    address: address,
    winner: true, //winners.includes(address),
  };
};

// allow CORS
const headers = {
  'Content-Type': 'application/json; charset=utf-8', //optional
  'Access-Control-Allow-Origin': '*',
};

exports.checkWinner = checkWinner;
exports.headers = headers;
