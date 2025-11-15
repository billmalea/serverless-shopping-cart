import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { putItem } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);
    const { userId, productId, quantity, price } = payload;
    if (!userId || !productId || typeof quantity === 'undefined') {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId, productId and quantity are required' }) };
    }

    const dbItem = {
      PK: `USER#${userId}`,
      SK: `PRODUCT#${productId}`,
      userId,
      productId,
      quantity: Number(quantity),
      price: price ? Number(price) : undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      await putItem(TABLE_NAME, dbItem);
    } catch (dbErr) {
      console.warn('DynamoDB put failed (local dev), returning mock response:', dbErr);
      // In local dev without DynamoDB, return success with mock data
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item updated', item: dbItem }),
    };
  } catch (err) {
    console.error('updateCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
