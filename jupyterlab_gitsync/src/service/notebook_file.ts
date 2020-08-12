import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, Notebook, NotebookModel } from '@jupyterlab/notebook';
import { ISignal, Signal } from '@lumino/signaling';

import { IFile } from './tracker';
import { NotebookResolver } from './notebook_resolver';

// TO DO (ashleyswang): implement most functionality for NotebookFile
// mostly a placeholder file with outline of needed functions
// so compiler doesn't complain

export class NotebookFile implements IFile {
  widget: NotebookPanel;
  content: Notebook;
  context: DocumentRegistry.Context;
  resolver: NotebookResolver;
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
    } catch (error) {
      console.warn(error);
    }
  }

  async reload() {
    this._getLocalVersion();
    this._getEditorView();
    const merged = await this.resolver.mergeVersions();
    if (merged) { await this._displayText(merged); }
  }

  private async _displayText(merged) {
    await this.context.revert();
    this._setEditorView(merged);
  }

  private async _getInitVersion() {
    await this.resolver.sendInitRequest();
  }

  private async _getLocalVersion() {
    const content = (this.content.model as NotebookModel).toJSON();
    this.resolver.addVersion(content, 'local');
  }

  private _getEditorView(){
    this.view = {
      left: this.content.node.scrollLeft,
      top: this.content.node.scrollTop
    };
    const activeIndex = this.content.activeCellIndex;
    const cursorPos = this.content.activeCell.editor.getCursorPosition();
    this.resolver.setCursorToken(activeIndex, cursorPos);
  }

  private _setEditorView(merged){
    const index = merged.index;
    const pos = merged.pos;
    const cell= this.content.widgets[index];
    cell.editor.setCursorPosition(pos);

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
