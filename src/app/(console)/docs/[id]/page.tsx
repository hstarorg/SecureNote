'use client';

import { globalVm } from '@/app/global-vm';
import { useParams, useRouter } from 'next/navigation';
import { RichEditor } from '@/components';
import { Button } from 'antd5';
import { useViewModel } from '@/utils/bizify';
import { DocDetailViewModel } from './DocDetailViewModel';
import { useRef } from 'react';

export default function Home() {
  const editorRef = useRef(null);
  const globalData = globalVm.$useSnapshot();
  const router = useRouter();
  const params = useParams();
  const vm = useViewModel(DocDetailViewModel, { docId: params.id });
  const vmData = vm.$useSnapshot();

  const updateAt = vmData.docDetail?.updatedAt;

  return (
    <main className="pt-16">
      <header className="h-16 border-b fixed top-0 left-[250px] right-0 px-4 flex z-10 bg-white">
        <div className="flex-1 py-3">
          <div className="text-base">{vmData.docDetail?.title}</div>
          {updateAt ? (
            <div className="text-xs text-gray-500">
              Last update at: {updateAt}
            </div>
          ) : null}
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
      <div className="">
        <RichEditor
          onInit={vm.setEditorEngine}
          content={vmData.docDetail?.content || ''}
          readonly={!vmData.isEdit}
        />
      </div>
    </main>
  );
}
