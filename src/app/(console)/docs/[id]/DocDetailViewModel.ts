import { getDocumentDetail, saveDocumentContent } from '@/services';
import { evmWallet, aesEncrypt, aesDecrypt } from '@/utils';
import { ControllerBase, ServiceInstance } from '@/utils/bizify';
import { globalVm } from '@/app/global-vm';
import { message } from 'antd5';
import { DocumentRespDto } from '@/types/dto-types';
import Engine from '@aomao/engine';

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
      identityModal: { open: false },
    };
  }

  protected $onCreated = (inParams?: any) => {
    this.state.docId = inParams.docId;
    this.loadDocumentDetail();
  };

  private async loadDocumentDetail() {
    this.state.getDocumentDetailApi
      .execute({ docId: this.state.docId })
      .then(async (data) => {
        this.processDocument(data);
      });
  }

  private async processDocument(docDetail: DocumentRespDto) {
    if (!this.state.docPassword) {
      const seed = globalVm.$getState().user?.identitySeed || '';

      const identity = await evmWallet.getIdentityByWallet(seed);

      const docPassword = await evmWallet.decryptWithPrivateKey(
        docDetail.pwd2,
        identity.privateKey
      );
      this.state.docPassword = docPassword;
    }

    // 此时密码都有了
    let decryptedContent = '';
    if (docDetail.content) {
      decryptedContent = await aesDecrypt(
        docDetail.content,
        this.state.docPassword
      );
    }

    this.state.docDetail = { ...docDetail, content: decryptedContent };
  }

  setEditorEngine(engine: Engine) {
    this.editorEngine = engine;
  }

  startEdit() {
    this.state.isEdit = true;
  }

  async saveDocument() {
    const content = this.editorEngine.model.toValue();
    const encryptedContent = await aesEncrypt(content, this.state.docPassword);

    this.state.saveDocumentContentApi
      .execute({ docId: this.state.docId, content: encryptedContent })
      .then((data) => {
        message.success('Save success');
        this.state.isEdit = false;
      });
  }
}
