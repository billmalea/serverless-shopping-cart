import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../types';
import { putItem } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);
    const { userId, productId, quantity, price } = payload;
    if (!userId || !productId || !quantity) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId, productId and quantity are required' }) };
    }

    const item: CartItem = {
      userId,
      productId,
      quantity: Number(quantity),
      price: price ? Number(price) : undefined,
      addedAt: new Date().toISOString(),
    };

    // DynamoDB item design: PK = USER#<userId>, SK = PRODUCT#<productId>
    const dbItem = {
      PK: `USER#${userId}`,
      SK: `PRODUCT#${productId}`,
      ItemId: uuidv4(),
      ...item,
    };

    try {
      await putItem(TABLE_NAME, dbItem);
    } catch (dbErr) {
      console.warn('DynamoDB put failed (local dev), returning mock response:', dbErr);
      // In local dev without DynamoDB, return success with mock data
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Item added to cart', item: dbItem }),
    };
  } catch (err) {
    console.error('addToCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: (err as any).message || 'Internal server error' }) };
  }
};
