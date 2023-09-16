'use client';

import Engine from '@aomao/engine';
import Toolbar, {
  ToolbarPlugin,
  ToolbarComponent,
  ToolbarOptions,
} from '@aomao/toolbar';
import Heading from '@aomao/plugin-heading';
import Orderedlist from '@aomao/plugin-orderedlist';
import Unorderedlist from '@aomao/plugin-unorderedlist';
import Quote from '@aomao/plugin-quote';
import CodeBlock, { CodeBlockComponent } from '@aomao/plugin-codeblock';
import Bold from '@aomao/plugin-bold';
import Italic from '@aomao/plugin-italic';
import Code from '@aomao/plugin-code';
import Link from '@aomao/plugin-link';
import Table, { TableComponent } from '@aomao/plugin-table';
import { PureComponent, useEffect, useRef, useState } from 'react';

export type RichEditorProps = { content: string };

export function RichEditor(props: RichEditorProps) {
  const domRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    const engine = new Engine(domRef.current!, {
      plugins: [
        Orderedlist,
        Unorderedlist,
        ToolbarPlugin,
        Heading,
        CodeBlock,
        Bold,
        Code,
        Link,
        Quote,
        Table,
        Italic,
      ],
      cards: [ToolbarComponent, CodeBlockComponent, TableComponent],
      config: {
        [ToolbarPlugin.pluginName]: {
          config: [
            {
              title: 'Tools', // optional
              items: [
                { name: 'codeblock', title: 'Code Block' },
                { name: 'table', title: 'Table' },
                // 'math',
                // 'status',
              ],
            },
          ],
          popup: {
            // 选中后弹出的 popup 工具栏
            items: [
              [{ name: 'undo', title: 'Undo' }, 'redo'],
              {
                icon: 'text',
                items: [
                  'bold',
                  'italic',
                  'strikethrough',
                  'underline',
                  'backcolor',
                  'moremark',
                ],
              },
            ],
          } as ToolbarOptions,
        },
      },
    });

    setEngine(engine);
  }, []);

  useEffect(() => {
    if (engine && props.content) {
      engine.setValue(props.content);
    }
  }, [engine, props.content]);

  const engineInitialed = !!engine;
  return (
    <div>
      <div className="text-left">
        {engineInitialed ? (
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
                        { name: 'table', title: 'Table' },
                      ],
                    },
                  ],

                  // groups: [
                  //   {
                  //     title: 'File',
                  //     items: ['image-uploader', 'file-uploader'],
                  //   },
                  // ],
                },
              ],
              ['bold', 'italic', 'link'],
            ]}
          />
        ) : null}
      </div>
      <div
        className="w-[782px] px-4 pt-4 mx-auto border-x border-gray-100 min-h-[calc(100vh_-_100px)]"
        ref={domRef}
      ></div>
    </div>
  );
}

class RichEditor2 extends PureComponent<RichEditorProps> {
  private domRef!: HTMLDivElement;

  private engine?: Engine;

  componentDidMount(): void {
    this.engine = new Engine(this.domRef, {
      plugins: [ToolbarPlugin, Heading, CodeBlock, Bold, Code, Link],
      cards: [ToolbarComponent, CodeBlockComponent],
      config: {},
    });
    //Set the editor value
    this.engine.setValue(this.props.content);
    //Listen to the editor value change event
    // engine.on('change', () => {
    //   const value = engine.getValue();
    //   setContent(value);
    //   console.log(`value:${value}`);
    // });
    this.forceUpdate();
  }

  public getEditorValue() {
    return this.engine!.model.toValue();
  }

  render() {
    const engineInitialed = !!this.engine;
    return (
      <div>
        <div className="text-left">
          {engineInitialed ? (
            <Toolbar
              className="!border-t-0"
              engine={this.engine!}
              items={[['collapse'], ['bold']]}
            />
          ) : null}
        </div>
        <div
          className="w-[782px] px-4 pt-4 mx-auto border-x border-gray-100 min-h-[calc(100vh_-_100px)]"
          ref={(ref) => (this.domRef = ref!)}
        ></div>
      </div>
    );
  }
}
