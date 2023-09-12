import { proxy, useSnapshot } from 'valtio';

import { bizifyBus } from './bizify-bus';
import { AsyncFunction, ServiceInstance, ServiceOptions } from './bizify-types';
import { createService } from './utils';

export abstract class ControllerBase<TData extends object = any> {
  private listernerMap = new Map<string, ((...args: any[]) => void)[]>();

  protected abstract $data(): TData;

  protected $onCreated?: (inParams?: any) => void;

  protected $onMounted?: (inParams?: any) => void;

  protected $onUnMounted?: () => void;

  private vmId = Math.random();

  protected state!: TData;

  protected $broadcastHandlers: Record<string, (...args: any[]) => void> = {};

  __call__(fnName: string, ...args: any[]): any {
    return (this as any)[fnName]?.(...args);
  }

  private $__init__(): void {
    const innerData = this.$data();
    this.autoBindThis();
    this.state = proxy(Object.assign(innerData, {}));
  }

  private $__destroy__(): void {
    this.listernerMap.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        bizifyBus.removeListener(event, listener);
      });
    });
    this.listernerMap.clear();
  }

  private autoBindThis(): void {
    const allPrototypeProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    allPrototypeProperties
      .filter((key) => key !== 'constructor' && !key.startsWith('$'))
      .forEach((key) => {
        const val = (this as any)[key];
        if (typeof val === 'function') {
          (this as any)[key] = val.bind(this);
        }
      });
  }

  private $__onMounted__() {
    console.debug('mounted', this.vmId);
    // 自动绑定 $boardcast 处理函数
    Object.keys(this.$broadcastHandlers || {}).forEach((eventName: string) => {
      this.$on(eventName, this.$broadcastHandlers[eventName]);
    });
    this.$onMounted?.();
  }

  private $__onUnMounted__() {
    console.debug('unmounted', this.vmId);
    this.$__destroy__();
    this.$onUnMounted?.();
  }

  protected $broadcast(event: string, ...args: any[]): void {
    bizifyBus.emit(event, ...args);
  }

  protected $on(event: string, listener: (...args: any[]) => void): void {
    // 缓存 listerners，用于卸载时清理
    const listeners: ((...args: any[]) => void)[] = this.listernerMap.get(event) || [];
    listeners.push(listener);
    this.listernerMap.set(event, listeners);

    bizifyBus.on(event, listener);
  }

  protected $createService<FN extends AsyncFunction = any>(fn: FN, options?: ServiceOptions): ServiceInstance<FN> {
    return createService(fn, options);
  }

  public $getState(): TData {
    return this.state;
  }
  // eslint-disable-next-line
  public $useSnapshot(options?: { sync?: boolean }) {
    // eslint-disable-next-line
    const snapshot = useSnapshot(this.state!, { sync: options?.sync !== false });
    return snapshot;
  }
}
