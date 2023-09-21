import { NextRequest } from 'next/server';

import { processGatewayRequest } from '@/server';

export async function POST(request: NextRequest, context: { params: any }) {
  console.log('in POST');
  return await processGatewayRequest(request, context);
}
