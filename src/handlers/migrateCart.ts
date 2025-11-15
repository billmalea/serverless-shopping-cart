import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { putItem } from '../lib/dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);
    const { userId, items } = payload;
    if (!userId || !Array.isArray(items)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId and items[] required' }) };
    }

    // For the scaffold, write items to DynamoDB (simple approach)
    const written = [] as any[];
    for (const it of items) {
      const dbItem = {
        PK: `USER#${userId}`,
        SK: `PRODUCT#${it.productId}`,
        ItemId: uuidv4(),
        userId,
        productId: it.productId,
        quantity: Number(it.quantity || 1),
        price: it.price ? Number(it.price) : undefined,
        migratedAt: new Date().toISOString(),
      };
      await putItem(TABLE_NAME, dbItem);
      written.push(dbItem);
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Migration completed', written }) };
  } catch (err) {
    console.error('migrateCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
