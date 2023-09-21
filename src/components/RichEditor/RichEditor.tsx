'use client';

import Engine from '@aomao/engine';

import Bold from '@aomao/plugin-bold';
import Code from '@aomao/plugin-code';
import CodeBlock, { CodeBlockComponent } from '@aomao/plugin-codeblock';
import Heading from '@aomao/plugin-heading';
import Italic from '@aomao/plugin-italic';
import Link from '@aomao/plugin-link';
import Orderedlist from '@aomao/plugin-orderedlist';
import Quote from '@aomao/plugin-quote';
import Table, { TableComponent } from '@aomao/plugin-table';
import Unorderedlist from '@aomao/plugin-unorderedlist';
import Toolbar, { ToolbarComponent, ToolbarOptions, ToolbarPlugin } from '@aomao/toolbar';
import { useEffect, useRef, useState } from 'react';

export type RichEditorProps = {
  content: string;
  readonly?: boolean;
  onInit?: (engine: Engine) => void;
};

export default function RichEditor(props: RichEditorProps) {
  const domRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    const engine = new Engine(domRef.current!, {
      plugins: [Orderedlist, Unorderedlist, ToolbarPlugin, Heading, CodeBlock, Bold, Code, Link, Quote, Table, Italic],
      cards: [ToolbarComponent, CodeBlockComponent, TableComponent],
      config: {
        [ToolbarPlugin.pluginName]: {
          config: [
            {
              title: 'Tools', // optional
              items: [
                { name: 'codeblock', title: 'Code Block' },
                { name: 'table', title: 'Table' }
                // 'math',
                // 'status',
              ]
            }
          ],
          popup: {
            // 选中后弹出的 popup 工具栏
            items: [
              [{ name: 'undo', title: 'Undo' }, 'redo'],
              {
                icon: 'text',
                items: ['bold', 'italic', 'strikethrough', 'underline', 'backcolor', 'moremark']
              }
            ]
          } as ToolbarOptions
        }
      },
      readonly: true,
      placeholder: 'Please input content here'
    });
    setEngine(engine);

    props.onInit?.(engine);
  }, []);

  useEffect(() => {
    if (engine) {
      engine.readonly = !!props.readonly;
      if (!props.readonly) {
        domRef.current?.focus();
      }
    }
  }, [engine, props.readonly]);

  useEffect(() => {
    if (engine && props.content) {
      engine.setValue(props.content);
    }
  }, [engine, props.content]);

  // engine 初始化且非 readonly 时显示工具栏
  const toobarVisible = !!engine && !props.readonly;
  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-left">
        {toobarVisible ? (
          <Toolbar
            className="!border-t-0"
            engine={engine!}
            items={[
              [
                {
                  type: 'collapse',
                  groups: [
                    {
                      items: [
                        // 'orderedlist',
                        // 'unorderedlist',
                        // 'quote',
                        { name: 'codeblock', title: 'Code Block' },
                        { name: 'table', title: 'Table' }
                      ]
                    }
                  ]

                  // groups: [
                  //   {
                  //     title: 'File',
                  //     items: ['image-uploader', 'file-uploader'],
                  //   },
                  // ],
                }
              ],
              ['bold', 'italic', 'link']
            ]}
          />
        ) : null}
      </div>
      <div className="w-full px-4 pt-4 mx-auto border-x border-gray-100 flex-1 overflow-auto" ref={domRef}></div>
    </div>
  );
}
