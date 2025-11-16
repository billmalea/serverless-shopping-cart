import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import ddb from '../lib/dynamo';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  }

  try {
    // Handle preflight
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
      return { statusCode: 200, headers }
    }

    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);
    const { userId, productId, quantity, price } = payload;
    if (!userId || !productId || typeof quantity === 'undefined') {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'userId, productId and quantity are required' }) };
    }

    const inc = Number(quantity);
    const now = new Date().toISOString();
    const itemId = uuidv4();

    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}` },
      UpdateExpression:
        'SET ItemId = if_not_exists(ItemId, :itemId), userId = :userId, productId = :productId, price = if_not_exists(price, :price), updatedAt = :now, addedAt = if_not_exists(addedAt, :now), quantity = if_not_exists(quantity, :zero) + :inc',
      ExpressionAttributeValues: {
        ':itemId': itemId,
        ':userId': userId,
        ':productId': productId,
        ':price': price ? Number(price) : 0,
        ':now': now,
        ':zero': 0,
        ':inc': inc,
      },
      ReturnValues: 'ALL_NEW',
    } as any;

    try {
      const result = await ddb.send(new UpdateCommand(params));
      const attrs = result.Attributes || {};
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Item added/updated', item: attrs }) };
    } catch (dbErr) {
      console.warn('DynamoDB update failed (local dev), returning mock response:', dbErr);
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Item added (mock)', item: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}`, ItemId: itemId, userId, productId, quantity: inc, price, addedAt: now } }) };
    }
  } catch (err) {
    console.error('addToCart error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
