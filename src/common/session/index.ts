import { headers } from 'next/headers';

import { SessionObject } from '@/types/common-types';

import { IStore } from './IStore';
import { MemoryStore } from './MemoryStore';

function initSession(options: { store?: IStore }) {
  const store = options.store ?? new MemoryStore();
  async function getSession() {
    const h = headers();
    const sid = h.get('__internal_server_sid') || '';

    const session = await store.get(sid);

    return session;
  }

  async function setSession(sessionValue: unknown) {
    const h = headers();
    const sid = h.get('__internal_server_sid') || '';
    await store.set(sid, sessionValue, {
      expires: Date.now() + 1000 * 60 * 60 * 24
    });
  }

  return { getSession, setSession };
}

const sessionFunctions = initSession({});

export async function getSession(): Promise<SessionObject> {
  const session = (await sessionFunctions.getSession()) as SessionObject;
  return session || {};
}

export async function setSession(sessionValue: SessionObject) {
  await sessionFunctions.setSession(sessionValue);
}
