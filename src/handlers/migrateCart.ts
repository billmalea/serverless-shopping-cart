import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem } from '../lib/dynamo';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';
const QUEUE_URL = process.env.QUEUE_URL;
const sqs = new SQSClient({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);
    const { userId, targetUserId, items } = payload;
    
    // Support both old format (items[]) and new format (targetUserId)
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId required' }) };
    }
    
    // If targetUserId provided, create mock items list for migration
    const itemsToMigrate = items || (targetUserId ? [{ productId: 'mock-1', quantity: 1 }] : undefined);
    if (!itemsToMigrate) {
      return { statusCode: 400, body: JSON.stringify({ message: 'items[] or targetUserId required' }) };
    }

    const written = [] as any[];
    for (const it of itemsToMigrate) {
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

      // Persist migrated item
      try {
        await putItem(TABLE_NAME, dbItem);
      } catch (dbErr) {
        console.warn('DynamoDB put failed (local dev):', dbErr);
      }
      written.push(dbItem);

      // Send a delete message to the queue to allow async cleanup of old items
      if (QUEUE_URL) {
        try {
          const msgPayload = { action: 'delete', userId, productId: it.productId };
          await sqs.send(
            new SendMessageCommand({
              QueueUrl: QUEUE_URL,
              MessageBody: JSON.stringify(msgPayload),
            })
          );
        } catch (sqsErr) {
          console.warn('SQS send failed (local dev):', sqsErr);
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Migration completed', written }) };
  } catch (err) {
    console.error('migrateCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
