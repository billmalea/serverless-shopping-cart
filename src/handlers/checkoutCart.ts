import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

function extractUserFromEvent(event: any): { userId?: string; claims?: any } {
  // Preferred: API Gateway + Cognito authorizer populates requestContext.authorizer.jwt.claims
  const claims = event?.requestContext?.authorizer?.jwt?.claims;
  if (claims && claims.sub) {
    return { userId: claims['cognito:username'] || claims.sub, claims };
  }

  // Fallback: Authorization header (Bearer <token>) - caller may embed userId in body instead
  const auth = event?.headers?.authorization || event?.headers?.Authorization;
  if (auth && typeof auth === 'string') {
    // We won't validate the token here — this is an example. For actual validation, use jwt verification.
    return { claims: { token: auth } };
  }

  return {};
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }
    const payload = JSON.parse(event.body);
    // If userId supplied in body prefer it; otherwise try to extract from JWT claims
    const extracted = extractUserFromEvent(event as any);
    const userId = payload.userId || extracted.userId;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId required' }) };

    // Example: show caller identity in response for integration tests
    const actor = extracted.claims ? { claims: extracted.claims } : undefined;

    // Placeholder: in a real implementation this would call payment/fulfillment systems.
    return { statusCode: 200, body: JSON.stringify({ message: 'Checkout accepted', userId, actor }) };
  } catch (err) {
    console.error('checkoutCart error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
