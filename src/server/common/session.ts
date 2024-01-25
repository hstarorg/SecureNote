import { IronSession, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '../constants';
import { SessionObject } from '@/types/common-types';

export async function getSession(): Promise<IronSession<SessionObject>> {
  const session = await getIronSession(cookies(), sessionOptions);
  return session;
}
