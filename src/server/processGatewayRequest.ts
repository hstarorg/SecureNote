import { NextRequest } from 'next/server';

export function processGatewayRequest(
  request: NextRequest,
  context: { params: any }
) {
  return new Response(JSON.stringify({ a: 'hi' }));
}
