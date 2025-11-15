import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { queryByUser } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const userId = event.pathParameters?.userId || (event.queryStringParameters && event.queryStringParameters.userId);
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId path parameter required' }) };
    }

    const items = await queryByUser(TABLE_NAME, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, items }),
    };
  } catch (err) {
    console.error('listCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
