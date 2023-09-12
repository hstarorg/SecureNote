import { EventEmitter } from 'events';
class BizifyBus extends EventEmitter {}

export const bizifyBus = new BizifyBus();
