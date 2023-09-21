import { message } from 'antd5';
import { nanoid } from 'nanoid';

import { createDocument, queryMyDocuments, setIdentity, signIn } from '@/services';
import { aesEncrypt, evmWallet } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';

import { globalVm } from '../global-vm';

type LayoutState = {
  signInApi: ServiceInstance<typeof signIn>;
  queryMyDocumentsApi: ServiceInstance<typeof queryMyDocuments>;
  setIdentityApi: ServiceInstance<typeof setIdentity>;
  createDocumentApi: ServiceInstance<typeof createDocument>;
  docModal: {
    open: boolean;
  };
  identityModal: {
    open: boolean;
  };
  search: string;
};

export class LayoutViewModel extends ControllerBase<LayoutState> {
  protected $data(): LayoutState {
    return {
      signInApi: this.$createService(signIn),
      queryMyDocumentsApi: this.$createService(queryMyDocuments),
      createDocumentApi: this.$createService(createDocument),
      setIdentityApi: this.$createService(setIdentity),
      docModal: { open: false },
      identityModal: { open: false },
      search: ''
    };
  }

  async connetWallet(): Promise<void> {
    const result = await evmWallet.signByEIP4361('Welcome to SecureNote!');

    this.state.signInApi.execute({ ...result, address: evmWallet.address as any }).then(() => {
      globalVm.loadUser();
    });
  }

  async signOut(): Promise<void> {
    globalVm.signOut();
  }

  async showDocModal(): Promise<void> {
    this.state.docModal.open = true;
  }

  async closeDocModal(): Promise<void> {
    this.state.docModal.open = false;
  }

  async loadMyDocuments(): Promise<void> {
    await this.state.queryMyDocumentsApi.execute({});
  }

  async handleCreateDoc(values: { title: any; description: any }, cb: (id: string) => void): Promise<void> {
    // 1. 随机生成文档密码
    const docPassword = nanoid();

    const user = globalVm.$getState().user;

    // 2. 用公钥加密密码
    const publicKey = user?.identityPublicKey;
    if (!publicKey) {
      message.error('Can not find identity public key, please set identity first');
    }
    console.log('docPassword', docPassword);

    const encryptedPassword = await evmWallet.encryptWithPublicKey(docPassword, publicKey!);
    console.log('encryptedPassword', encryptedPassword);
    // 3. 用密码加密文档内容
    const encryptedContent = await aesEncrypt('', docPassword);

    // 4. 提交到 DB
    const res = await this.state.createDocumentApi.execute({
      title: values.title,
      description: values.description || '',
      content: encryptedContent,
      pwd2: encryptedPassword
    });
    cb(res?.doc?.id);
    this.closeDocModal();
    this.loadMyDocuments();
  }

  showIdentityModal(): void {
    this.state.identityModal.open = true;
  }

  hideIdentityModal(): void {
    this.state.identityModal.open = false;
  }

  getSeed(): string {
    return `Seed for generate identity in Secure Note: ${nanoid()}`;
  }

  async handleSetIdentitySeed(values: { seed: string }): Promise<void> {
    const identity = await evmWallet.getIdentityByWallet(values.seed);

    await this.state.setIdentityApi.execute({
      identitySeed: values.seed,
      identityPublicKey: identity.publicKey
    });

    globalVm.loadUser();
  }
  setSearch(search: string): void {
    this.state.search = search;
  }
}
