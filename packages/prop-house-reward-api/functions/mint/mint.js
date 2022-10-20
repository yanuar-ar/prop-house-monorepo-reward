const ethers = require('ethers');
const { checkWinner, headers } = require('../helpers');

// EIP-712 domain
const domain = {
  name: process.env.SIGNING_DOMAIN_NAME,
  version: process.env.SIGNING_DOMAIN_VERSION,
  chainId: process.env.CHAIN_ID,
  verifyingContract: process.env.CONTRACT_ADDRESS,
};

// EIP-712 types
const types = {
  Minter: [
    { name: 'id', type: 'uint256' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'winner', type: 'address' },
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

    const { winner } = await checkWinner(id, address);

    const tokenId = 1;

    if (!winner) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          address: address,
          tokenId: -1,
          id: id,
          signature: '',
          winner: false,
        }),
        headers,
      };
    }

    // signing EIP-712
    let signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

    const signature = await signer._signTypedData(domain, types, {
      id: id,
      tokenId: tokenId,
      winner: address,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: id,
        tokenId: tokenId,
        address: address,
        signature: signature,
        winner: true,
      }),
      headers,
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
