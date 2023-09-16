import { cookies, headers } from 'next/headers';
import { IStore } from './session/IStore';
import { MemoryStore } from './session/MemoryStore';

export function initSession(options: { store?: IStore }) {
  const store = options.store ?? new MemoryStore();
  return async function getSession() {
    const c = cookies();
    const h = headers();
    const sid = c.get('sid')?.value || '';

    return await store.get(sid);
  };
}
