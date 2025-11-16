import { handler } from '../handlers/products'

describe('products handler', () => {
  it('returns list of products', async () => {
    const res: any = await (handler as any)({} as any)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body as string)
    expect(Array.isArray(body.products)).toBe(true)
    expect(body.products.length).toBeGreaterThan(0)
  })

  it('returns single product by id', async () => {
    const event: any = { pathParameters: { productId: 'prod-001' } }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body as string)
    expect(body.id).toBe('prod-001')
  })

  it('returns 404 for unknown product id', async () => {
    const event: any = { pathParameters: { productId: 'no-such' } }
    const res: any = await (handler as any)(event)
    expect(res.statusCode).toBe(404)
  })
})
