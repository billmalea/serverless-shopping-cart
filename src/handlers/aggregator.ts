import { DynamoDBStreamHandler } from 'aws-lambda';

export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    for (const record of event.Records) {
      // Basic scaffold: log changes. Real aggregator would compute metrics or update denormalized tables.
      console.log('stream record', record.eventID, record.eventName);
    }
  } catch (err) {
    console.error('aggregator error', err);
    throw err;
  }
};
