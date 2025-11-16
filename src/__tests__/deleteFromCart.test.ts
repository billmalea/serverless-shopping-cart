import { handler } from '../handlers/deleteFromCart'
import ddb from '../lib/dynamo'

describe('deleteFromCart handler', () => {
  beforeAll(() => {
    ;(ddb.send as any) = jest.fn().mockResolvedValue({})
    process.env.TABLE_NAME = 'cart-table'
  })

  afterAll(() => {
    jest.restoreAllMocks()
    delete process.env.TABLE_NAME
  })

  it('skips records with missing fields and deletes valid items', async () => {
    const event: any = {
      Records: [
        { body: JSON.stringify({ userId: 'u1' }) },
        { body: JSON.stringify({ userId: 'u1', productId: 'p1' }) },
      ],
    }

    await expect((handler as any)(event)).resolves.toBeUndefined()
    expect(ddb.send).toHaveBeenCalled()
  })
})
