import { handler } from '../handlers/checkoutCart'

describe('checkoutCart handler', () => {
  it('returns 400 when body missing', async () => {
    const res: any = await (handler as any)({} as any)
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when userId missing', async () => {
    const res: any = await (handler as any)({ body: JSON.stringify({}) } as any)
    expect(res.statusCode).toBe(400)
  })

  it('accepts checkout when userId provided in body', async () => {
    const event: any = { body: JSON.stringify({ userId: 'user-abc' }) }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.userId).toBe('user-abc')
  })

  it('extracts actor from requestContext claims when present', async () => {
    const event: any = {
      body: JSON.stringify({}),
      requestContext: { authorizer: { jwt: { claims: { sub: 'user-jwt' } } } },
    }
    const res: any = await (handler as any)(event)
    // handler will accept the extracted userId from claims and return 200
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.actor).toBeDefined()
    expect(body.actor.claims.sub).toBe('user-jwt')
  })
})
