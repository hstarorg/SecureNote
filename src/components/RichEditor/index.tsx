'use client';

import Engine from '@aomao/engine';
import Toolbar, { ToolbarPlugin, ToolbarComponent } from '@aomao/toolbar';
import Heading from '@aomao/plugin-heading';
import CodeBlock, { CodeBlockComponent } from '@aomao/plugin-codeblock';
import Bold from '@aomao/plugin-bold';
import Code from '@aomao/plugin-code';
// import Image, { ImageComponent, ImageUploader } from '@aomao/plugin-image';
import Link from '@aomao/plugin-link';
import { PureComponent } from 'react';

export type RichEditorProps = { content: string };

export class RichEditor extends PureComponent<RichEditorProps> {
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
