import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, Notebook, NotebookModel } from '@jupyterlab/notebook';
import { ISignal, Signal } from '@lumino/signaling';

import { CodeMirrorEditor } from '@jupyterlab/codemirror';

import { IFile } from './tracker';
import { NotebookResolver, TextResolver } from './notebook_resolver';

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
      await this.context.save();
      const content = (this.content.model as NotebookModel).toJSON();
      this.resolver.addVersion(content, 'base');
      console.log(this.path, 'saved');
    } catch (error) {
      console.warn(error);
    }
  }

  async reload() {
    console.log(this.path, 'reload start');
    this._getLocalVersion();
    this._getEditorView();
    const merged = await this.resolver.mergeVersions();
    setTimeout(async()=>{
      if (merged) { await this._displayText(merged); }
      console.log(this.path, 'reload finish');
    }, 5000); 
  }

  private async _displayText(merged) {
    const pos = this.activeCell.editor.getCursorPosition();
    this._addActiveVersion('local');
    await this.context.revert();
    this._setEditorView(merged, pos);
  }

  private _addActiveVersion(origin: 'base' | 'local' | 'remote'){
    const activeText = (this.activeCell.editor as CodeMirrorEditor).editor.getValue();
    this.cellResolver.addVersion(activeText, origin);
  }

  private async _getInitVersion() {
    await this.resolver.sendInitRequest();
  }

  private _getLocalVersion() {
    const content = (this.content.model as NotebookModel).toJSON();
    this.resolver.addVersion(content, 'local');
    this._addActiveVersion('base')
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

  private _setEditorView(merged, pos){
    if (merged.index !== undefined || merged.index !== null){
      this.content.activeCellIndex = merged.index;

      this._addActiveVersion('remote');
      const res = this.cellResolver.mergeVersions(pos);

      if (res){
        (this.activeCell.editor as CodeMirrorEditor).editor.setValue(res.text);
        this.activeCell.editor.setCursorPosition(res.pos);
      } else {
        this.activeCell.editor.setCursorPosition(merged.pos);
      }
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
    this._addListener((this.content
      .model as NotebookModel).stateChanged, this._dirtyStateListener);
  }
}
