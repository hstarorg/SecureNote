import {
  signIn,
  createDocument,
  queryMyDocuments,
  setIdentity,
} from '@/services';
import { evmWallet } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';
import { globalVm } from '../global-vm';
import { nanoid } from 'nanoid';

type LayoutState = {
  signInApi: ServiceInstance<typeof signIn>;
  queryMyDocumentsApi: ServiceInstance<typeof queryMyDocuments>;
  setIdentityApi: ServiceInstance<typeof setIdentity>;
  docModal: {
    open: boolean;
  };
  identityModal: {
    open: boolean;
  };
};

export class LayoutViewModel extends ControllerBase<LayoutState> {
  protected $data(): LayoutState {
    return {
      signInApi: this.$createService(signIn),
      queryMyDocumentsApi: this.$createService(queryMyDocuments),
      setIdentityApi: this.$createService(setIdentity),
      docModal: { open: false },
      identityModal: { open: false },
    };
  }

  async connetWallet() {
    const result = await evmWallet.signByEIP4361('Welcome to SecureNote!');

    this.state.signInApi
      .execute({ ...result, address: evmWallet.address as any })
      .then((data) => {
        globalVm.loadUser();
      });
  }

  async signOut() {
    globalVm.signOut();
  }

  async showDocModal() {
    this.state.docModal.open = true;
  }

  async closeDocModal() {
    this.state.docModal.open = false;
  }

  async loadMyDocuments() {
    this.state.queryMyDocumentsApi.execute({}).then((data) => {});
  }

  private async getIdentityByWallet(seed: string) {
    const signResult = await evmWallet.signByEIP712(
      JSON.stringify({
        types: {
          EIP712Domain: [{ name: 'name', type: 'string' }],
          Info: [{ name: 'seed', type: 'string' }],
        },
        primaryType: 'Info',
        domain: {
          name: 'Secure Note',
        },
        message: {
          seed,
        },
      })
    );
    const privateKey = signResult.signature.slice(0, 66) as `0x${string}`;
    const publicKey = evmWallet.getPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }

  async handleCreateDoc(values: any) {
    const nonce = nanoid();

    const docPassword = nanoid();

    const identity = await this.getIdentityByWallet(nonce);

    const encryptedPassword = await evmWallet.encryptWithPublicKey(
      docPassword,
      identity.publicKey
    );

    const encryptedContent = await evmWallet.encryptWithPublicKey(
      '',
      identity.publicKey
    );

    const doc = await createDocument({
      title: values.title,
      description: values.description || '',
      content: encryptedContent,
      pwd2: encryptedPassword,
    });

    this.closeDocModal();
  }

  showIdentityModal() {
    this.state.identityModal.open = true;
  }

  hideIdentityModal() {
    this.state.identityModal.open = false;
  }

  getSeed() {
    return `Seed for generate identity in Secure Note: ${nanoid()}`;
  }

  async handleSetIdentitySeed(values: { seed: string }) {
    const identity = await this.getIdentityByWallet(values.seed);

    const a = await this.state.setIdentityApi.execute({
      identitySeed: values.seed,
      identityPublicKey: identity.publicKey,
    });

    globalVm.loadUser();
  }
}
