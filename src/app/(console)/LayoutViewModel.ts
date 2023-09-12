import { signIn } from '@/services';
import { evmWallet } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';
import { globalVm } from '../global-vm';

type LayoutState = {
  signInApi: ServiceInstance<typeof signIn>;
};

export class LayoutViewModel extends ControllerBase<LayoutState> {
  protected $data(): LayoutState {
    return {
      signInApi: this.$createService(signIn),
    };
  }

  async connetWallet() {
    evmWallet.init();
    await evmWallet.connect();

    const result = await evmWallet.signByEIP4361('Welcome to SecureNote!');

    this.state.signInApi
      .execute({ ...result, address: evmWallet.address })
      .then((data) => {
        console.log(data);
        if (data.verified) {
          globalVm.setLoginUser({ address: evmWallet.address });
        }
      });
  }

  async signOut() {
    // TODO: session sign out
    // TODO: disconnect wallet
    globalVm.setLoginUser(undefined);
  }
}
