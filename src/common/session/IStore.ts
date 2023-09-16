export interface IStore {
  get(key: string): Promise<unknown>;

  set(key: string, value: unknown, options: { expires: number }): Promise<void>;

  touch(key: string, options: { expires: number }): Promise<void>;

  destroy(key: string): Promise<boolean>;
}
