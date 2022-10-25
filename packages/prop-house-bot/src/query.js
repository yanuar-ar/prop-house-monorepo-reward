const { gql } = require('graphql-request');

const upcomingAuctionsQuery = () => gql`
  {
    auctionsByStatus(status: Upcoming) {
      id
      title
      startTime
      community {
        name
        id
      }
      description
      fundingAmount
      currencyType
    }
  }
`;

const openAuctionsQuery = () => gql`
  {
    auctionsByStatus(status: Open) {
      id
      title
      startTime
      community {
        name
        id
      }
      description
      fundingAmount
      currencyType
    }
  }
`;

const votingAuctionsQuery = () => gql`
  {
    auctionsByStatus(status: Voting) {
      id
      title
      startTime
      community {
        name
        id
      }
      description
      fundingAmount
      currencyType
    }
  }
`;

const closedAuctionsQuery = () => gql`
  {
    auctionsByStatus(status: Closed, limit: 1000) {
      id
      title
      startTime
      proposals {
        id
        title
        tldr
        voteCount
      }
      community {
        name
        id
      }
      numWinners
      description
      fundingAmount
      currencyType
    }
  }
`;

const proposalsQuery = () => gql`
  {
    auctionsByStatus(status: Open, limit: 100) {
      id
      title
      startTime
      proposals {
        id
        title
        tldr
      }
      community {
        name
        id
      }
    }
  }
`;

const votingsQuery = () => gql`
  {
    auctionsByStatus(status: Voting, limit: 100) {
      id
      title
      startTime
      proposals {
        id
        title
        tldr
        voteCount
      }
      community {
        name
        id
      }
      numWinners
      description
      fundingAmount
      currencyType
      votingEndTime
    }
  }
`;

module.exports = {
  upcomingAuctionsQuery,
  openAuctionsQuery,
  votingAuctionsQuery,
  closedAuctionsQuery,
  proposalsQuery,
  votingsQuery,
};
