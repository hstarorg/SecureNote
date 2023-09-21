'use client';

import { Button, Spin } from 'antd5';
import { useParams } from 'next/navigation';

import { useEffect } from 'react';

import { RichEditor } from '@/components';

import { useViewModel } from '@/utils/bizify';

import { DocDetailViewModel } from './DocDetailViewModel';

export default function Home() {
  const params = useParams();
  const vm = useViewModel(DocDetailViewModel, { docId: params.id });
  const vmData = vm.$useSnapshot();

  const updateAt = vmData.docDetail?.updatedAt;
  useEffect(() => {
    if (vmData.getDocumentDetailApi.isLoadedOnce && vmData.docDetail?.content === '') {
      vm.startEdit();
    }
  }, [vmData.getDocumentDetailApi.isLoadedOnce, vmData.docDetail?.content]);
  return (
    <Spin spinning={vmData.getDocumentDetailApi.isLoading || vmData.saveDocumentContentApi.isLoading}>
      <main className="h-[calc(100vh-65px)] flex flex-col relative">
        <div className="flex flex-col justify-center items-center h-full">
          <div
            className={`w-full flex-1 flex flex-col h-full ${
              vmData.docDetail?.decryptedContent === undefined ? 'hidden' : ''
            }`}
          >
            <header className="h-16 border-b  px-4 flex z-10 bg-white">
              <div className="flex-1 py-3">
                <div className="text-base">{vmData.docDetail?.title}</div>
                {updateAt ? <div className="text-xs text-gray-500">Last update at: {updateAt}</div> : null}
              </div>
              <div className="py-4">
                {vmData.isEdit ? (
                  <Button type="primary" onClick={vm.saveDocument}>
                    Save
                  </Button>
                ) : (
                  <Button type="primary" onClick={vm.startEdit}>
                    Edit
                  </Button>
                )}
              </div>
            </header>
            <div
              className="flex-1 overflow-y-auto"
              onClick={() => {
                if (
                  !vmData.isEdit &&
                  (!vmData.docDetail?.decryptedContent ||
                    vmData.docDetail?.decryptedContent === '<p data-id="p1dr9j7ls-2ar4dzktr8ys0"><br /></p>')
                ) {
                  vm.startEdit();
                }
              }}
            >
              <RichEditor
                onInit={vm.setEditorEngine}
                content={vmData.docDetail?.decryptedContent || ''}
                readonly={!vmData.isEdit}
              />
            </div>
          </div>
          {vmData.docDetail?.decryptedContent === undefined && (
            <Button
              onClick={() => {
                vmData.docDetail && vm.processDocument(vmData.docDetail);
              }}
            >
              Decrypt
            </Button>
          )}
        </div>
      </main>
    </Spin>
  );
}
