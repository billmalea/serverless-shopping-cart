import { DynamoDBStreamHandler } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler: DynamoDBStreamHandler = async (event) => {
  const summary = {
    processed: 0,
    inserted: 0,
    modified: 0,
    removed: 0,
  };

  try {
    for (const record of event.Records) {
      summary.processed += 1;
      const { eventName } = record;

      // Extract the new/old image if present and convert to plain JS object
      const newImage = record.dynamodb?.NewImage ? unmarshall(record.dynamodb!.NewImage as any) : undefined;
      const oldImage = record.dynamodb?.OldImage ? unmarshall(record.dynamodb!.OldImage as any) : undefined;

      // Basic handling: log useful details and update counters.
      if (eventName === 'INSERT') {
        summary.inserted += 1;
        console.log('aggregator: INSERT', { id: newImage?.PK ?? newImage, item: newImage });
      } else if (eventName === 'MODIFY') {
        summary.modified += 1;
        console.log('aggregator: MODIFY', { pk: newImage?.PK ?? oldImage?.PK, before: oldImage, after: newImage });
      } else if (eventName === 'REMOVE') {
        summary.removed += 1;
        console.log('aggregator: REMOVE', { pk: oldImage?.PK ?? record.dynamodb?.Keys, item: oldImage });
      } else {
        console.log('aggregator: unknown event', eventName, record.eventID);
      }
    }

    console.log('aggregator summary', summary);
    return { statusCode: 200, body: JSON.stringify(summary) } as any;
  } catch (err) {
    console.error('aggregator error', err);
    throw err;
  }
};
