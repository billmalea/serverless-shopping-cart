import { handler } from '../handlers/aggregator'

describe('aggregator handler', () => {
  it('counts inserted records', async () => {
    const event: any = {
      Records: [
        { eventID: '1', eventName: 'INSERT', dynamodb: { NewImage: { PK: { S: 'USER#u1' } } } },
        { eventID: '2', eventName: 'MODIFY', dynamodb: { NewImage: { PK: { S: 'USER#u1' } }, OldImage: { PK: { S: 'USER#u1' } } } },
        { eventID: '3', eventName: 'REMOVE', dynamodb: { OldImage: { PK: { S: 'USER#u1' } } } },
      ],
    }

    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.processed).toBe(3)
    expect(body.inserted).toBe(1)
    expect(body.modified).toBe(1)
    expect(body.removed).toBe(1)
  })
})
