import { handler } from '../handlers/updateCart';
import * as dynamo from '../lib/dynamo';

(dynamo.putItem as any) = jest.fn().mockResolvedValue(undefined);

describe('updateCart handler', () => {
  it('returns 400 when body missing', async () => {
    const res: any = await (handler as any)({} as any);
    expect(res.statusCode).toBe(400);
  });

  it('updates item and returns 200', async () => {
    const event: any = {
      body: JSON.stringify({ userId: 'user1', productId: 'prod1', quantity: 3 }),
    };

    const res: any = await (handler as any)(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.message).toMatch(/Cart item updated/);
    expect(dynamo.putItem).toHaveBeenCalled();
  });
});
