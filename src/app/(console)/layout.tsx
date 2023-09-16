'use client';

import { PropsWithChildren, useEffect } from 'react';
import Image from 'next/image';
import { globalVm } from '../global-vm';
import { useViewModel } from '@/utils/bizify';
import { LayoutViewModel } from './LayoutViewModel';
import { evmWallet } from '@/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd5';
import { ModalForm } from '@/components';

export default function ConsoleLayout(props: PropsWithChildren<{}>) {
  const vm = useViewModel(LayoutViewModel);
  const vmData = vm.$useSnapshot();

  const globalData = globalVm.$useSnapshot();

  useEffect(() => {
    globalVm.loadUser();
  }, []);

  const loggedIn = !!globalData.user;

  useEffect(() => {
    if (loggedIn && !vmData.queryMyDocumentsApi.isLoadedOnce) {
      vm.loadMyDocuments();
    }
  }, [loggedIn]);

  useEffect(() => {
    // 已登录但没有身份种子，就需要去设置
    if (loggedIn) {
      if (!globalData.user?.identitySeed) {
        vm.showIdentityModal();
      } else {
        vm.hideIdentityModal();
      }
    }
  }, [loggedIn, globalData.user?.identitySeed]);

  const userAddress = evmWallet.shortenWalletAddress(
    globalData.user?.address || '',
    'shorter'
  );

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
        {loggedIn ? (
          <>
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
          </>
        ) : (
          <div className="text-center mt-4">Please sign in!</div>
        )}
      </div>
      <div className="ml-[250px]">{props.children}</div>
      <ModalForm
        title="Create new document"
        open={vmData.docModal.open}
        onCancel={vm.closeDocModal}
        onSubmit={vm.handleCreateDoc}
        formProps={{ layout: 'vertical' }}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>
      </ModalForm>
      {vmData.identityModal.open ? (
        <ModalForm
          title="Enable Security Identity"
          open={true}
          onSubmit={vm.handleSetIdentitySeed}
          formProps={{
            layout: 'vertical',
            initialValues: { seed: vm.getSeed() },
          }}
          modalProps={{
            closable: false,
            cancelButtonProps: { style: { display: 'none' } },
          }}
        >
          <Form.Item
            label="Recovery Code"
            name="seed"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} style={{ resize: 'none' }} />
          </Form.Item>
          <Alert
            type="warning"
            message={
              <div>
                Please backup this content! You can use this recovery your
                documents password.
                <br />
                This will be only set once!
              </div>
            }
          />
        </ModalForm>
      ) : null}
    </main>
  );
}
