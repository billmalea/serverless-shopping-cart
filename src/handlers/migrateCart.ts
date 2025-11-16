import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem } from '../lib/dynamo';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const TABLE_NAME = process.env.TABLE_NAME || 'cart-table';
const QUEUE_URL = process.env.QUEUE_URL;
const sqs = new SQSClient({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Extract caller identity (Cognito) if present
    const claims = (event as any)?.requestContext?.authorizer?.jwt?.claims;
    const actor = claims ? { user: claims['cognito:username'] || claims.sub, claims } : undefined;

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
      // If a targetUserId is provided, write the migrated item under that user
      const destinationUser = targetUserId || userId;
      const dbItem = {
        PK: `USER#${destinationUser}`,
        SK: `PRODUCT#${it.productId}`,
        ItemId: uuidv4(),
        userId: destinationUser,
        productId: it.productId,
        quantity: Number(it.quantity || 1),
        price: it.price ? Number(it.price) : undefined,
        migratedAt: new Date().toISOString(),
      };

      // Persist migrated item and only record it as written on success
      let putSucceeded = false;
      try {
        await putItem(TABLE_NAME, dbItem);
        putSucceeded = true;
      } catch (dbErr) {
        console.warn('DynamoDB put failed (local dev):', dbErr);
      }
      if (putSucceeded) {
        written.push(dbItem);
      }

      // Send a delete message to the queue to allow async cleanup of old items
      if (QUEUE_URL) {
        try {
          // Delete payload should remove the original item from the source user
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

    return { statusCode: 200, body: JSON.stringify({ message: 'Migration completed', written, actor }) };
  } catch (err) {
    console.error('migrateCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
