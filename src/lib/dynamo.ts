import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const putItem = async (tableName: string, item: Record<string, any>) => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );
};

export const queryByUser = async (tableName: string, userId: string) => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
    })
  );
  return result.Items || [];
};

export default ddb;
