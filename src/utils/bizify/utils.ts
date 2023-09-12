import { useEffect, useRef } from 'react';

import { ControllerBase } from './ControllerBase';
import { AsyncFunction, ServiceInstance, ServiceOptions } from './bizify-types';

export function defineViewModel<TData extends object, TC extends ControllerBase<TData>>(CtrlCtor: new () => TC): TC {
  const ctrl = new CtrlCtor();
  ctrl.__call__('$__init__');
  return ctrl;
}

export function useViewModel<TData extends object, TC extends ControllerBase<TData>>(
  CtrlCtor: new () => TC,
  inParams?: unknown
): TC {
  const initialedRef = useRef(false);
  const ctrlRef = useRef<TC>();
  if (!initialedRef.current) {
    initialedRef.current = true;
    const ctrl = (ctrlRef.current = new CtrlCtor());
    ctrl.__call__('$__init__');

    // 调用 $onCreated 生命周期
    ctrl.__call__('$onCreated', inParams);
  }

  useEffect(() => {
    ctrlRef.current!.__call__('$__onMounted__');
    return () => {
      ctrlRef.current!.__call__('$__onUnMounted__');
    };
  }, []);

  return ctrlRef.current!;
}

export function createService<FN extends AsyncFunction = any>(fn: FN, options?: ServiceOptions): ServiceInstance<FN> {
  const config: { lastId: number } = { lastId: 0 };
  console.debug(options);
  return {
    data: null,
    error: null,
    status: 'pending',
    isLoadedOnce: false,
    get isLoading() {
      return this.status === 'loading';
    },
    get isSuccess() {
      return this.status === 'success';
    },
    get isError() {
      return this.status === 'error';
    },
    execute(...args): ReturnType<FN> {
      // 每次执行，都会生成一个新的 id
      const currentId = ++config.lastId;
      this.status = 'loading';

      return fn(...args)
        .then((data) => {
          if (currentId < config.lastId) {
            return Promise.reject(new Error('outdated request'));
          }
          this.data = data;
          this.error = null;
          this.status = 'success';
          return data;
        })
        .catch((reason) => {
          if (currentId < config.lastId) {
            return Promise.reject(new Error('outdated request'));
          }
          this.error = reason;
          this.status = 'error';
          return Promise.reject(reason);
        })
        .finally(() => {
          if (currentId < config.lastId) {
            return;
          }
          // 完成一次之后，标记为已加载过
          if (!this.isLoadedOnce) {
            this.isLoadedOnce = true;
          }
        }) as ReturnType<FN>;
    }
  };
}
