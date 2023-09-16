import { NextRequest, NextResponse } from 'next/server';
import { actionHandlers } from './action-handlers';

function json(resData: unknown) {
  return NextResponse.json({ success: true, data: resData, statusCode: 200 });
}

function jsonError(message: string, statusCode: number, error?: Error) {
  return NextResponse.json({
    success: false,
    statusCode,
    message,
    error,
  });
}

export async function processGatewayRequest(
  request: NextRequest,
  context: { params: any }
) {
  // 1. Parse the request data
  const url = new URL(request.url);

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const data = await request.json();

  // 2. Find the action handler
  const action = data.action;
  if (!action) {
    return jsonError('No action provided', 400);
  }
  if (!actionHandlers[action]) {
    return jsonError('No action found', 400);
  }

  // 2.1 execute action handler
  try {
    const requesInfo = {
      pathname: url.pathname,
      params: context.params,
      query,
      data: data.data,
    };

    const result = await actionHandlers[action](requesInfo);
    return json(result);
  } catch (reason: unknown) {
    console.error(reason);
    return jsonError('Error executing action', 500, reason as Error);
  }
}
