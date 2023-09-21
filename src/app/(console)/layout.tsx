'use client';

import { HomeOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Dropdown, Form, Input, Spin } from 'antd5';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

import { ModalForm } from '@/components';
import { evmWallet } from '@/utils';
import { useViewModel } from '@/utils/bizify';

import { globalVm } from '../global-vm';

import { LayoutViewModel } from './LayoutViewModel';

export default function ConsoleLayout(props: PropsWithChildren<object>) {
  const vm = useViewModel(LayoutViewModel);
  const vmData = vm.$useSnapshot();
  const router = useRouter();
  const pathname = usePathname();

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

  const userAddress = evmWallet.shortenWalletAddress(globalData.user?.address || '', 'shorter');

  const docs = vmData.queryMyDocumentsApi.data?.rows || [];
  const docId = pathname.split('/')[2];

  return (
    <Spin
      className="h-[500px]"
      spinning={
        vmData.queryMyDocumentsApi.isLoading || vmData.signInApi.isLoading || vmData.queryMyDocumentsApi.isLoading
      }
    >
      <main className="h-[100vh] flex flex-col  bg-[#ffffff]">
        <div className="relative z-10 flex flex-row justify-between items-center  border-b ">
          {/* logo area */}
          <div className="flex h-16  py-2 px-4 cursor-pointer" onClick={() => router.push('/')}>
            <div>
              <Image src="/sn-logo.png" alt="secure note" width={47} height={47} />
            </div>
            <div className="pl-2 text-2xl font-bold leading-[47px]">Secure Note</div>
          </div>
          {/* user area */}
          <div className="py-2 text-center flex flex-row ">
            <div className="mr-4">
              {loggedIn ? (
                <Dropdown.Button
                  menu={{
                    items: [
                      {
                        label: 'Sign Out',
                        key: '1',
                        icon: <LogoutOutlined />
                      }
                    ],
                    onClick: () => vm.signOut()
                  }}
                >
                  <div className="flex flex-row">
                    <Image className="mr-2" alt="" width={20} height={20} src={'/metamask.svg'}></Image> {userAddress}
                  </div>
                </Dropdown.Button>
              ) : (
                <Button type="primary" onClick={vm.connetWallet}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-row">
          {loggedIn ? (
            <div className="w-[250px] h-[calc(100vh-65px)] border-r  flex flex-col">
              {/* toc area */}
              <div>
                <div className="flex p-2">
                  <div className="flex-1">
                    <Input.Search
                      onChange={(e) => {
                        vm.setSearch(e.target.value);
                      }}
                    />
                  </div>
                  <div className="pl-2">
                    <Button icon={<PlusOutlined />} onClick={vm.showDocModal} />
                  </div>
                </div>
              </div>
              <div className="px-2 flex-1 flex flex-col overflow-hidden">
                <div
                  className={`px-2 py-1 rounded  cursor-pointer ${pathname === '/' ? 'bg-gray-200' : ''}`}
                  onClick={() => router.push('/')}
                >
                  <HomeOutlined /> Overview
                </div>
                <ul className="mt-2 flex-1 overflow-auto">
                  {docs
                    .filter((doc: any) => doc.title.includes(vmData.search))
                    .map((doc: any) => {
                      return (
                        <li
                          key={doc.id}
                          className={
                            'px-2 py-1 mb-2 rounded hover:cursor-pointer hover:bg-gray-200' +
                            (docId === doc.id ? ' bg-gray-200' : '')
                          }
                          onClick={() => router.push(`/docs/${doc.id}`)}
                        >
                          {doc.title}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          ) : null}
          <div className="h-full w-full  flex-1">{props.children}</div>
        </div>
        <ModalForm
          title="Create new document"
          open={vmData.docModal.open}
          onCancel={vm.closeDocModal}
          onSubmit={(values) =>
            vm.handleCreateDoc(values, (id) => {
              router.push(`/docs/${id}`);
            })
          }
          formProps={{ layout: 'vertical' }}
          modalProps={{ maskClosable: false }}
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
              initialValues: { seed: vm.getSeed() }
            }}
            modalProps={{
              closable: false,
              cancelButtonProps: { style: { display: 'none' } }
            }}
          >
            <Form.Item label="Recovery Code" name="seed" rules={[{ required: true }]}>
              <Input.TextArea rows={4} style={{ resize: 'none' }} />
            </Form.Item>
            <Alert
              type="warning"
              message={
                <div>
                  Please backup this content! You can use this recovery your documents password.
                  <br />
                  This will be only set once!
                </div>
              }
            />
          </ModalForm>
        ) : null}
      </main>
    </Spin>
  );
}
