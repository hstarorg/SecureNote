import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

import { SessionObject } from '@/types/common-types';

import { sessionOptions } from '../constants';

export async function getSession(): Promise<IronSession<SessionObject>> {
  const session = await getIronSession(cookies(), sessionOptions);
  return session;
}
