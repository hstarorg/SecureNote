'use client';

import { globalVm } from '@/app/global-vm';
import { PropsWithChildren } from 'react';

export default function DocsLayout(props: PropsWithChildren<{}>) {
  const globalData = globalVm.$useSnapshot();

  if (!globalData.isLogged) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center h-[400px] text-2xl">
          Please sign in to view
        </div>
      </div>
    );
  }
  return props.children;
}
