export type ServiceOptions = object;

export type ServiceInstance<FN extends AsyncFunction> = {
  data: ReturnType<FN> | null;
  status: 'pending' | 'loading' | 'error' | 'success'; // 服务状态
  isLoadedOnce: boolean; // 是否已经加载过一次
  isLoading: boolean; // 是否正在加载
  isSuccess: boolean; // 是否加载成功
  isError: boolean; // 是否加载失败
  error: null | any; //
  execute: (...args: Parameters<FN>) => ReturnType<FN>;
};

export type Promisify<T> = T extends Promise<any> ? T : Promise<T>;

export type AsyncFunction = (...args: any[]) => Promise<any>;

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K];
};

export type WithoutReadonly<T> = {
  -readonly [K in keyof T]: T[K] extends Record<string, unknown> ? WithoutReadonly<T[K]> : T[K];
};
