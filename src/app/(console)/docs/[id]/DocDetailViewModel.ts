import Engine from '@aomao/engine';
import { message } from 'antd5';

import { globalVm } from '@/app/global-vm';
import { getDocumentDetail, saveDocumentContent } from '@/services';
import { DocumentRespDto } from '@/types/dto-types';
import { aesDecrypt, aesEncrypt, evmWallet } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';

type ViewState = {
  docId: string;
  docPassword: string;
  docDetail?: DocumentRespDto;
  isEdit: boolean;
  getDocumentDetailApi: ServiceInstance<typeof getDocumentDetail>;
  saveDocumentContentApi: ServiceInstance<typeof saveDocumentContent>;
  docModal: {
    open: boolean;
  };
  identityModal: {
    open: boolean;
  };
};

export class DocDetailViewModel extends ControllerBase<ViewState> {
  private editorEngine!: Engine;
  protected $data(): ViewState {
    return {
      docId: '',
      docPassword: '',
      isEdit: false,
      getDocumentDetailApi: this.$createService(getDocumentDetail),
      saveDocumentContentApi: this.$createService(saveDocumentContent),
      docModal: { open: false },
      identityModal: { open: false }
    };
  }

  protected $onCreated = (inParams?: { [key: string]: any }): void => {
    this.state.docId = inParams?.docId;
    this.loadDocumentDetail();
  };

  private async loadDocumentDetail() {
    this.state.getDocumentDetailApi.execute({ docId: this.state.docId }).then(async (data) => {
      this.state.docDetail = data;
    });
  }

  async processDocument(docDetail: DocumentRespDto): Promise<void> {
    if (!this.state.docPassword) {
      const seed = globalVm.$getState().user?.identitySeed || '';

      const identity = await evmWallet.getIdentityByWallet(seed);

      const docPassword = await evmWallet.decryptWithPrivateKey(docDetail.pwd2, identity.privateKey);
      this.state.docPassword = docPassword;
    }

    // 此时密码都有了
    let decryptedContent = undefined;
    if (docDetail.content) {
      try {
        decryptedContent = await aesDecrypt(docDetail.content, this.state.docPassword);
      } catch (error) {
        console.log(error);
      }
    } else {
      decryptedContent = '';
    }
    this.state.docDetail = { ...docDetail, decryptedContent };
  }

  setEditorEngine(engine: Engine): void {
    this.editorEngine = engine;
  }

  startEdit(): void {
    this.state.isEdit = true;
  }

  async saveDocument(): Promise<void> {
    const content = this.editorEngine.model.toValue();
    const encryptedContent = await aesEncrypt(content, this.state.docPassword);

    this.state.saveDocumentContentApi.execute({ docId: this.state.docId, content: encryptedContent }).then(() => {
      message.success('Save success');
      this.state.isEdit = false;
    });
  }
}
