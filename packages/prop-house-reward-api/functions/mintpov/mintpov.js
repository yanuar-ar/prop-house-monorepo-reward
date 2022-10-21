const ethers = require('ethers');
const { checkVoter, headers } = require('../helpers');

// EIP-712 domain
const domain = {
  name: process.env.SIGNING_DOMAIN_NAME,
  version: process.env.SIGNING_DOMAIN_VERSION,
  chainId: process.env.CHAIN_ID,
  verifyingContract: process.env.PROOF_OF_VOTE_CONTRACT_ADDRESS,
};

// EIP-712 types
const types = {
  Minter: [
    { name: 'id', type: 'uint256' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'voter', type: 'address' },
  ],
};

const handler = async event => {
  // should be GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 501,
      body: JSON.stringify({ message: 'Not Implemented' }),
      headers: { 'content-type': 'application/json' },
    };
  }

  try {
    const address = event.queryStringParameters.address;
    const id = event.queryStringParameters.id;

    const { voter } = await checkVoter(id, address);

    const tokenId = 1;

    // if not voter
    if (!voter) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          address: address,
          tokenId: -1,
          id: id,
          signature: '',
          voter: false,
        }),
        headers,
      };
    }

    // if winner
    // signing EIP-712
    let signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

    const signature = await signer._signTypedData(domain, types, {
      id: id,
      tokenId: tokenId,
      voter: address,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: id,
        tokenId: tokenId,
        address: address,
        signature: signature,
        voter: true,
      }),
      headers,
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
