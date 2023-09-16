import { IStore } from './IStore';

export class MemoryStore implements IStore {
  private sessions: Map<string, { data: unknown; expires: number }> = new Map();

  async get(key: string): Promise<unknown> {
    const value = this.sessions.get(key);
    if (!value) {
      return null;
    }
    // 检查过期
    if (value.expires < Date.now()) {
      this.sessions.delete(key);
      return null;
    }
    return value.data;
  }
  async set(
    key: string,
    value: unknown,
    options: { expires: number }
  ): Promise<void> {
    this.sessions.set(key, { data: value, expires: options.expires });
  }

  async touch(key: string, options: { expires: number }): Promise<void> {
    const value = this.sessions.get(key);
    if (!value) {
      return;
    }
    value.expires = options.expires;
  }

  async destroy(key: string): Promise<boolean> {
    return this.sessions.delete(key);
  }
}
