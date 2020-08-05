import { IDocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';
import { ContentsManager } from '@jupyterlab/services';
import { FileEditor } from '@jupyterlab/fileeditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import { CodeMirror } from 'codemirror';

import { MergeResolver } from './resolver';

const fs = new ContentsManager();

export class File {
  widget: IDocumentWidget;
  context: DocumentRegistry.Context;
  editor: CodeMirror;
  doc: CodeMirror.doc;

  resolve: MergeResolver;
  view: { 
    left: number,
    top: number, 
    right: number,
    bottom: number 
  }

  constructor(widget: IDocumentWidget) {
    this.widget = widget;
    this.context = widget.context;
    this.editor = ((widget.content as FileEditor)
      .editor as CodeMirrorEditor).editor;
    this.doc = this.editor.doc;
    this.resolve = new MergeResolver(this.path);

    this._getInitVersion();
  }

  get path() {
    return this.widget.context.path;
  }

  async save() {
    await this.context.save();
  }

  async reload() {
    await this._getRemoteVersion();
    this._getLocalVersion();
    console.log('--------------');
    this._getEditorView();
    const text = await this.resolve.mergeVersions();
    if (text) {
      await this.context.revert();
      this.doc.setValue(text);
      this._setEditorView();
    }
  }

  private async _getInitVersion() {
    const contents = await fs.get(this.path);
    this.resolve.addVersion(contents.content, 'base');
    this.resolve.addVersion(contents.content, 'remote');
    this.resolve.addVersion(contents.content, 'local');
  }

  private async _getRemoteVersion() {
    const contents = await fs.get(this.path);
    this.resolve.addVersion(contents.content, 'remote');
  }

  private _getLocalVersion() {
    const text = this.doc.getValue();
    this.resolve.addVersion(text, 'local');
  }

  private _getEditorView() {
    const cursor = this.doc.getCursor();
    this.resolve.setCursorToken(cursor);
    const scroll = this.editor.getScrollInfo();
    this.view = {
      left: scroll.left, 
      top: scroll.top, 
      right: scroll.left + scroll.clientWidth,
      bottom: scroll.top + scroll.clientHeight
    }

    console.log('Before Change');
    console.log(this.view);
    
  }

  private _setEditorView() {
    const cursor = this.resolve.getCursor();
    this.doc.setCursor(cursor);
    this.editor.scrollIntoView(this.view);

    console.log('After Change');
    console.log(this.editor.getScrollInfo());
  }

}
