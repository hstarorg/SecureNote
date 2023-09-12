'use client';

import { PropsWithChildren } from 'react';
import Image from 'next/image';
import { globalVm } from '../global-vm';
import { useViewModel } from '@/utils/bizify';
import { LayoutViewModel } from './LayoutViewModel';
import { evmWallet } from '@/utils';

export default function ConsoleLayout(props: PropsWithChildren<{}>) {
  const vm = useViewModel(LayoutViewModel);

  const globalData = globalVm.$useSnapshot();

  const userAddress = evmWallet.shortenWalletAddress(
    globalData.user?.address || '',
    'shorter'
  );

  const loggedIn = !!globalData.user;

  return (
    <main className="flex">
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
      </div>
      <div className="ml-[250px]">{props.children}</div>
    </main>
  );
}
