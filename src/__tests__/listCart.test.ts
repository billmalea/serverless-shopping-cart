import { handler } from '../handlers/listCart';
import * as dynamo from '../lib/dynamo';

const sampleItems = [
  { PK: 'USER#user1', SK: 'PRODUCT#prod1', productId: 'prod1', quantity: 2 },
];

(dynamo.queryByUser as any) = jest.fn().mockResolvedValue(sampleItems);

describe('listCart handler', () => {
  it('returns 400 when userId missing', async () => {
    const res: any = await (handler as any)({} as any);
    expect(res.statusCode).toBe(400);
  });

  it('returns items for valid userId', async () => {
    const event: any = { pathParameters: { userId: 'user1' } };
    const res: any = await (handler as any)(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.items).toEqual(sampleItems);
    expect(dynamo.queryByUser).toHaveBeenCalledWith('cart-table', 'user1');
  });
});
