import { ControllerBase, defineViewModel } from '@/utils/bizify';

type GlobalState = {
  user?: { address: string; avatar: string };
};

class GlobalVM extends ControllerBase<GlobalState> {
  protected $data(): GlobalState {
    return {
      // ...
    };
  }
}

export const globalVm = defineViewModel(GlobalVM);
