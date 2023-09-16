import { processGatewayRequest } from '@/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, context: { params: any }) {
  console.log('in POST');
  return await processGatewayRequest(request, context);
}
