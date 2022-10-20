const { checkWinner, headers } = require('../helpers');

const handler = async event => {
  // should be POST
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

    const data = await checkWinner(id, address);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: headers,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
      headers: headers,
    };
  }
};

module.exports = { handler };
