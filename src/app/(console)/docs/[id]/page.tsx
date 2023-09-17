'use client';

import { globalVm } from '@/app/global-vm';
import { useRouter } from 'next/navigation';
import { RichEditor } from '@/components';
import { Button } from 'antd5';

export default function Home() {
  const globalData = globalVm.$useSnapshot();
  const router = useRouter();

  if (!globalVm.$getState().user) {
    // router.replace('/');
  }

  return (
    <main className="pt-16">
      <header className="h-16 border-b fixed top-0 left-[250px] right-0 px-4 flex z-10 bg-white">
        <div className="flex-1">标题1</div>
        <div className="py-4">
          <Button type="primary">Edit</Button>
        </div>
      </header>
      <div className="">
        <RichEditor content="Hello" readonly />
      </div>
    </main>
  );
}
