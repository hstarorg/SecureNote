'use client';

import Engine, { EngineInterface } from '@aomao/engine';
import Toolbar, { ToolbarPlugin, ToolbarComponent } from '@aomao/toolbar';
import Heading from '@aomao/plugin-heading';
import CodeBlock, { CodeBlockComponent } from '@aomao/plugin-codeblock';
import Bold from '@aomao/plugin-bold';
import Code from '@aomao/plugin-code';
import Image, { ImageComponent, ImageUploader } from '@aomao/plugin-image';
import Link from '@aomao/plugin-link';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  //Editor container
  const ref = useRef<HTMLDivElement | null>(null);
  //Engine instance
  const [engine, setEngine] = useState<EngineInterface>();
  //Editor content
  const [content, setContent] = useState<string>('<p>Hello world!</p>');

  useEffect(() => {
    if (!ref.current) return;
    //Instantiate the engine
    const engine = new Engine(ref.current, {
      plugins: [
        ToolbarPlugin,
        Heading,
        CodeBlock,
        Bold,
        Code,
        Link,
        Image,
        ImageUploader,
      ],
      cards: [ToolbarComponent, CodeBlockComponent, ImageComponent],
      config: {
        [ImageUploader.pluginName]: {
          action: 'https://test.upload',
        },
      },
    });
    //Set the editor value
    engine.setValue(content);
    //Listen to the editor value change event
    engine.on('change', () => {
      const value = engine.getValue();
      setContent(value);
      console.log(`value:${value}`);
    });
    //Set the engine instance
    setEngine(engine);
  }, []);

  return (
    <main className="p-4">
      <h1>
        开始编辑{' '}
        <button className="p-2 border rounded" onClick={() => {}}>
          Save
        </button>{' '}
      </h1>
      <div className="border h-screen w-full">
        {engine ? (
          <Toolbar engine={engine!} items={[['collapse'], ['bold']]} />
        ) : null}
        <div className="px-4 flex justify-center">
          <div ref={ref} className="w-[1024px]"></div>
        </div>
      </div>
    </main>
  );
}
