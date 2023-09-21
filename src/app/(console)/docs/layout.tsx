'use client';

import { PropsWithChildren } from 'react';

import { globalVm } from '@/app/global-vm';

export default function DocsLayout(props: PropsWithChildren<object>) {
  const globalData = globalVm.$useSnapshot();

  if (!globalData.isLogged) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="text-center h-[400px] text-2xl">Please sign in to view</div>
      </div>
    );
  }
  return props.children;
}
