import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, Notebook, NotebookModel } from '@jupyterlab/notebook';
import { ISignal, Signal } from '@lumino/signaling';

import { ContentsManager, Contents } from '@jupyterlab/services';

import { IFile } from './tracker';
import { NotebookResolver, TextResolver } from './notebook_resolver';

const fs = new ContentsManager();

export class NotebookFile implements IFile {
  widget: NotebookPanel;
  content: Notebook;
  context: DocumentRegistry.Context;
  resolver: NotebookResolver;
  cellResolver: TextResolver = new TextResolver();
  view: {
    left: number,
    top: number
  }
  cursor: {
    index: number,
    pos: {
      line: number,
      column: number
    }
  }

  // TO DO (ashleyswang): decide how git path is passed into NotebookFile
  // needed for NotebookResolver handlers
  git_path: string = 'jupyterlab_gitsync/TEST';

  private _conflictState: Signal<this, boolean> = new Signal<this, boolean>(this);
  private _dirtyState: Signal<this, boolean> = new Signal<this, boolean>(this);

  constructor(widget: NotebookPanel) {
    this.widget = widget;
    this.content = widget.content;
    this.context = widget.context;
    this.resolver = new NotebookResolver(this);

    this._getInitVersion();
    this._addListeners();
  }

  get path(): string {
    return this.widget.context.path;
  }

  get activeCell() {
    return this.content.activeCell;
  }

  get activeCellIndex(): number {
    return this.content.activeCellIndex;
  }

  get conflictState(): ISignal<this, boolean> {
    return this._conflictState;
  }

  get dirtyState(): ISignal<this, boolean> {
    return this._dirtyState;
  }

  async save() {
    try{
      const content = (this.content.model as NotebookModel).toJSON();
      await this._saveFile(content);
      this.resolver.addVersion(content, 'base');
      console.log(this.path, 'saved');
    } catch (error) {
      console.warn(error);
    }
  }

  async reload() {
    console.log(this.path, 'reload start');
    await this._getRemoteVersion():
    this._getLocalVersion();
    this._getEditorView();
    const merged = await this.resolver.mergeVersions();
    if (merged) { await this._displayText(merged); }
    console.log(this.path, 'reload finish');
  }

  private async _displayText(merged) {
    await this._saveFile(merged)
    await this.context.revert();
    this._setEditorView(merged);
  }

  private async _saveFile(content: any){
    const options = {
      content: content,
      format: 'json' as Contents.FileFormat,
      path: this.path,
      type: 'notebook' as Contents.ContentType,
    }
    await fs.save(this.path, options);
  }

  private async _getInitVersion() {
    const contents = await fs.get(this.path);
    this.resolver.addVersion(contents.content, 'base');
    this.resolver.addVersion(contents.content, 'remote');
    this.resolver.addVersion(contents.content, 'local');
  }

  private async _getRemoteVersion() {
    try{
      const contents = await fs.get(this.path);
      console.log(contents);
      this.resolver.addVersion(contents.content, 'remote');
    } catch (error) {
      console.log(error);
    }
  }

  private _getLocalVersion() {
    const content = (this.content.model as NotebookModel).toJSON();
    this.resolver.addVersion(content, 'local');
  }

  private _getEditorView(){
    this.view = {
      left: this.content.node.scrollLeft,
      top: this.content.node.scrollTop
    };
    const activeIndex = this.activeCellIndex;
    const cursorPos = this.activeCell.editor.getCursorPosition();
    this.resolver.setCursorToken(activeIndex, cursorPos);
  }

  private _setEditorView(merged){
    this.cursor = this.resolver.removeCursorToken();

    if (this.cursor.index !== undefined || this.cursor.index !== null){
      this.content.activeCellIndex = this.cursor.index;
      this.activeCell.editor.setCursorPosition(this.cursor.pos);
    }

    this.content.node.scrollLeft = this.view.left;
    this.content.node.scrollTop = this.view.top;
  }

  private _addListener(signal: ISignal<any, any>, callback: any){
    return signal.connect(callback, this);
  }

  private _dirtyStateListener(sender: NotebookModel, value: any){
    console.log(value);
    if (value.name === 'dirty'){ this._dirtyState.emit(value.newValue); }
  }

  private _addListeners() {
    this._addListener((this.content.model as NotebookModel).stateChanged, this._dirtyStateListener);
  }
}
