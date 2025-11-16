import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { queryByUser } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

    // Preflight
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
      return { statusCode: 200, headers }
    }

    const userId = event.pathParameters?.userId;
    if (!userId) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId path parameter required' }) };
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
      headers,
      body: JSON.stringify({ userId, items }),
    };
  } catch (err) {
    console.error('listCart error', err);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
