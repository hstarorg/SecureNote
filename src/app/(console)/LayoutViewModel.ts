import { signIn } from '@/services';
import { evmWallet } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';
import { globalVm } from '../global-vm';
import { nanoid } from 'nanoid';

type LayoutState = {
  signInApi: ServiceInstance<typeof signIn>;
  docModal: {
    open: boolean;
  };
};

export class LayoutViewModel extends ControllerBase<LayoutState> {
  protected $data(): LayoutState {
    return {
      signInApi: this.$createService(signIn),
      docModal: { open: false },
    };
  }

  async connetWallet() {
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

  async showDocModal() {
    this.state.docModal.open = true;
  }

  async closeDocModal() {
    this.state.docModal.open = false;
  }

  async handleCreateDoc() {
    const docPassword = nanoid();
    const rnd = nanoid();
    const signResult = await evmWallet.signByEIP712(
      JSON.stringify({
        types: {
          EIP712Domain: [{ name: 'name', type: 'string' }],
          Info: [{ name: 'nonce', type: 'string' }],
        },
        primaryType: 'Info',
        domain: {
          name: 'Secure Note',
        },
        message: {
          nonce: rnd,
        },
      })
    );

    const privateKey = signResult.signature.slice(0, 66) as `0x${string}`;
    const pubKey = evmWallet.getPublicKey(privateKey);

    console.log('pubKey', pubKey);

    const encryptedPassword = await evmWallet.encryptWithPublicKey(
      docPassword,
      pubKey
    );

    const d = await evmWallet.decryptWithPrivateKey(
      encryptedPassword,
      privateKey
    );
    console.log(encryptedPassword, rnd, d, docPassword, d === docPassword);
  }
}
