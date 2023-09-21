import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export function middleware(request: NextResponse) {
  let sid = request.cookies.get('_sn')?.value;

  if (!sid) {
    sid = nanoid() + nanoid();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('__internal_server_sid', sid);

  // You can also set request headers in NextResponse.rewrite
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders
    }
  });

  response.cookies.set('_sn', sid);

  return response;
}

export const config = {
  matcher: ['/:path*']
};
