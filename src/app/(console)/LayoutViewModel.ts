import {
  signIn,
  createDocument,
  queryMyDocuments,
  setIdentity,
} from '@/services';
import { evmWallet, aesEncrypt } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';
import { globalVm } from '../global-vm';
import { nanoid } from 'nanoid';
import { message } from 'antd5';

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

  async handleCreateDoc(values: any) {
    // 1. 随机生成文档密码
    const docPassword = nanoid();

    const user = globalVm.$getState().user;

    // 2. 用公钥加密密码
    const publicKey = user?.identityPublicKey;
    if (!publicKey) {
      message.error(
        'Can not find identity public key, please set identity first'
      );
    }
    const encryptedPassword = await evmWallet.encryptWithPublicKey(
      docPassword,
      publicKey!
    );

    // 3. 用密码加密文档内容
    const encryptedContent = await aesEncrypt('', docPassword);

    // 4. 提交到 DB
    const doc = await createDocument({
      title: values.title,
      description: values.description || '',
      content: encryptedContent,
      pwd2: encryptedPassword,
    });

    this.closeDocModal();
    this.loadMyDocuments();
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
    const identity = await evmWallet.getIdentityByWallet(values.seed);

    const a = await this.state.setIdentityApi.execute({
      identitySeed: values.seed,
      identityPublicKey: identity.publicKey,
    });

    globalVm.loadUser();
  }
}
