import dynamic from 'next/dynamic';
import type { RichEditorProps } from './RichEditor';
import type { ComponentType } from 'react';

export const RichEditor: ComponentType<RichEditorProps> = dynamic(
  () => import('./RichEditor'),
  {
    loading: () => <span></span>,
  }
);
