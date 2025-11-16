import { handler } from '../handlers/migrateCart'
import * as dynamo from '../lib/dynamo'
import { SQSClient } from '@aws-sdk/client-sqs'

describe('migrateCart handler', () => {
  beforeAll(() => {
    ;(dynamo.putItem as any) = jest.fn().mockResolvedValue(undefined)
    ;(SQSClient.prototype.send as any) = jest.fn().mockResolvedValue({})
    process.env.QUEUE_URL = 'https://example-queue-url'
  })

  afterAll(() => {
    jest.restoreAllMocks()
    delete process.env.QUEUE_URL
  })

  it('returns 400 when body missing', async () => {
    const res: any = await (handler as any)({} as any)
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when userId missing', async () => {
    const event: any = { body: JSON.stringify({ items: [{ productId: 'prod-1' }] }) }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(400)
  })

  it('migrates items when userId and items provided', async () => {
    const event: any = { body: JSON.stringify({ userId: 'user-a', items: [{ productId: 'prod-1', quantity: 1 }] }) }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body as string)
    expect(body.message).toMatch(/Migration completed/)
    expect((dynamo.putItem as any)).toHaveBeenCalled()
  })

  it('writes to targetUserId when provided', async () => {
    const event: any = { body: JSON.stringify({ userId: 'user-a', targetUserId: 'user-b', items: [{ productId: 'prod-2', quantity: 2 }] }) }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body as string)
    expect(body.written && body.written.length).toBeGreaterThan(0)
    // ensure putItem called with destination PK (USER#user-b)
    const calledWith = (dynamo.putItem as any).mock.calls[ (dynamo.putItem as any).mock.calls.length - 1 ][1]
    expect(calledWith.PK).toBe('USER#user-b')
  })
})
