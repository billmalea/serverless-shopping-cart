import { SQSHandler } from 'aws-lambda';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import ddb from '../lib/dynamo';

export const handler: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const { userId, productId } = body;
      if (!userId || !productId) continue;

      // Delete item from DynamoDB
      await ddb.send(
        new DeleteCommand({
          TableName: process.env.TABLE_NAME || 'cart-table',
          Key: { PK: `USER#${userId}`, SK: `PRODUCT#${productId}` },
        })
      );
    }
  } catch (err) {
    console.error('deleteFromCart error', err);
    throw err;
  }
};
