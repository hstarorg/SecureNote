'use client';

import { globalVm } from '@/app/global-vm';
import { PropsWithChildren } from 'react';

export default function DocsLayout(props: PropsWithChildren<{}>) {
  const globalData = globalVm.$useSnapshot();

  if (!globalData.isLogged) {
    return <div>Please sign in</div>;
  }
  return props.children;
}
