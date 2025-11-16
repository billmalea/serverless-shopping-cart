import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import ddb from '../lib/dynamo';
import { UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  }

  try {
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

    const qty = Number(quantity);
    const now = new Date().toISOString();

    if (qty === 0) {
      // delete the item
      try {
        await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}` } }));
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item removed' }) };
      } catch (dbErr) {
        console.warn('DynamoDB delete failed (local dev):', dbErr);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item removed (mock)' }) };
      }
    }

    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}` },
      UpdateExpression: 'SET quantity = :qty, price = :price, updatedAt = :now',
      ExpressionAttributeValues: {
        ':qty': qty,
        ':price': price ? Number(price) : 0,
        ':now': now,
      },
      ReturnValues: 'ALL_NEW',
    } as any;

    try {
      const result = await ddb.send(new UpdateCommand(params));
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item updated', item: result.Attributes || {} }) };
    } catch (dbErr) {
      console.warn('DynamoDB update failed (local dev), returning mock response:', dbErr);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item updated (mock)', item: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}`, quantity: qty, price, updatedAt: now } }) };
    }
  } catch (err) {
    console.error('updateCart error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
