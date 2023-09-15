'use client';

import { PropsWithChildren } from 'react';
import Image from 'next/image';
import { globalVm } from '../global-vm';
import { useViewModel } from '@/utils/bizify';
import { LayoutViewModel } from './LayoutViewModel';
import { evmWallet } from '@/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { ModalForm } from '@/components';

export default function ConsoleLayout(props: PropsWithChildren<{}>) {
  const vm = useViewModel(LayoutViewModel);
  const vmData = vm.$useSnapshot();

  const globalData = globalVm.$useSnapshot();

  const userAddress = evmWallet.shortenWalletAddress(
    globalData.user?.address || '',
    'shorter'
  );

  const loggedIn = !!globalData.user;

  return (
    <main>
      <div className="fixed left-0 top-0 bottom-0 w-[250px] border-r bg-[#fafafa]">
        {/* logo area */}
        <div className="flex h-16 border-b py-2 px-4">
          <div>
            <Image
              src="/sn-logo.png"
              alt="secure note"
              width={47}
              height={47}
            />
          </div>
          <div className="pl-2 text-2xl font-bold leading-[47px]">
            Secure Note
          </div>
        </div>
        {/* user area */}
        <div className="py-2 text-center flex flex-col border-b">
          <div className="text-center">
            <Image
              className="rounded-[50%] inline-block"
              src="https://avatars.githubusercontent.com/u/4043284?v=4"
              alt="avatar"
              width={80}
              height={80}
            />
          </div>
          <div className="p-2">{userAddress}</div>
          <div>
            {loggedIn ? (
              <button
                className="border py-1 px-2 rounded-md hover:bg-slate-100"
                onClick={vm.signOut}
              >
                Disconnect
              </button>
            ) : (
              <button
                className="border py-1 px-2 rounded-md hover:bg-slate-100"
                onClick={vm.connetWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        {/* toc area */}
        <div>
          <div className="flex px-4 py-2">
            <div className="flex-1">
              <Input.Search />
            </div>
            <div className="pl-4">
              <Button icon={<PlusOutlined />} onClick={vm.showDocModal} />
            </div>
          </div>
        </div>
        <div className="px-4">
          <ul>
            <li>这是一份文档</li>
          </ul>
        </div>
      </div>
      <div className="ml-[250px]">{props.children}</div>
      <ModalForm
        title="Create new document"
        open={vmData.docModal.open}
        onCancel={vm.closeDocModal}
        onSubmit={vm.handleCreateDoc}
        formProps={{ layout: 'vertical' }}
      >
        <Form.Item label="Title">
          <Input />
        </Form.Item>
      </ModalForm>
    </main>
  );
}
