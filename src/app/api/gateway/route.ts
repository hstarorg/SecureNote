import { processGatewayRequest } from '@/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, context: { params: any }) {
  return await processGatewayRequest(request, context);
}
