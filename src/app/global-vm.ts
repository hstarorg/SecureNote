import { getUser, signOut } from '@/services';
import { UserRespDto } from '@/types/dto-types';
import {
  ControllerBase,
  ServiceInstance,
  defineViewModel,
} from '@/utils/bizify';

type GlobalState = {
  user?: UserRespDto;
  getUserApi: ServiceInstance<typeof getUser>;
  signOutApi: ServiceInstance<typeof signOut>;
};

class GlobalVM extends ControllerBase<GlobalState> {
  protected $data(): GlobalState {
    return {
      getUserApi: this.$createService(getUser),
      signOutApi: this.$createService(signOut),
    };
  }

  loadUser() {
    this.state.getUserApi.execute().then((user) => {
      this.state.user = user;
    });
  }

  signOut() {
    this.state.signOutApi.execute();
    this.state.user = undefined;
  }
}

export const globalVm = defineViewModel(GlobalVM);
