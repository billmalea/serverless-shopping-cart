import { handler } from '../handlers/addToCart';
import * as dynamo from '../lib/dynamo';

(dynamo.putItem as any) = jest.fn().mockResolvedValue(undefined);

describe('addToCart handler', () => {
  it('returns 400 when body missing', async () => {
    const res: any = await (handler as any)({} as any);
    expect(res.statusCode).toBe(400);
  });

  it('adds item and returns 201', async () => {
    const event: any = {
      body: JSON.stringify({ userId: 'user1', productId: 'prod1', quantity: 2 }),
    };

    const res: any = await (handler as any)(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body as string);
    expect(body.message).toMatch(/Item added/);
    expect(dynamo.putItem).toHaveBeenCalled();
  });
});
