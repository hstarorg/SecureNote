import { getUser, signOut } from '@/services';
import { UserRespDto } from '@/types/dto-types';
import { ControllerBase, defineViewModel, ServiceInstance } from '@/utils/bizify';

type GlobalState = {
  user?: UserRespDto;
  isLogged: boolean;
  isLoaded: boolean;
  getUserApi: ServiceInstance<typeof getUser>;
  signOutApi: ServiceInstance<typeof signOut>;
};

class GlobalVM extends ControllerBase<GlobalState> {
  protected $data(): GlobalState {
    return {
      isLogged: false,
      isLoaded: false,
      getUserApi: this.$createService(getUser),
      signOutApi: this.$createService(signOut)
    };
  }

  loadUser() {
    this.state.getUserApi.execute().then((user) => {
      this.state.isLoaded = true;
      this.state.user = user;
      if (user) {
        this.state.isLogged = true;
      }
    });
  }

  signOut() {
    this.state.signOutApi.execute();
    this.state.user = undefined;
    this.state.isLogged = false;
  }
}

export const globalVm = defineViewModel(GlobalVM);
