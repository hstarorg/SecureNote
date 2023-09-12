import { ControllerBase, defineViewModel } from '@/utils/bizify';

type GlobalState = {
  user?: { address: string; avatar?: string };
};

class GlobalVM extends ControllerBase<GlobalState> {
  protected $data(): GlobalState {
    return {
      // ...
    };
  }

  setLoginUser(user: { address: string; avatar?: string } | undefined) {
    this.state.user = user;
  }
}

export const globalVm = defineViewModel(GlobalVM);
