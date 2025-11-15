import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { queryByUser } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId path parameter required' }) };
    }

    let items: any[] = [];
    try {
      items = await queryByUser(TABLE_NAME, userId);
    } catch (dbErr) {
      console.warn('DynamoDB query failed (local dev), returning empty cart:', dbErr);
      // In local dev without DynamoDB, return empty cart
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, items }),
    };
  } catch (err) {
    console.error('listCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
