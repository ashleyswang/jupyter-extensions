import { CodeEditor } from '@jupyterlab/codeeditor';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { ISignal, Signal } from '@lumino/signaling';
import { requestAPI } from './request_api';
import { default as merge } from 'diff3';

import { IResolver } from './tracker';
import { NotebookFile } from './notebook_file';

function token() {
  let token = '';
  while (token.length < 32)
    token += Math.random()
      .toString(36)
      .substr(2);
  return '/$*' + token + '*$/';
}

interface Versions {
  base: any;
  local: any;
  remote: any;
  local_tok: any;
}

export class NotebookResolver implements IResolver {
  _file: NotebookFile;
  _token: string = token();
  _cursor: CodeEditor.IPosition;
  _fpath: string;
  _dpath: string;

  private _versions: Versions = {
    base: undefined,
    local: undefined,
    remote: undefined,
    local_tok: undefined
  };

  private _conflict: boolean;
  private _conflictState: Signal<this, boolean> = new Signal<this, boolean>(this);

  constructor(file: NotebookFile) {
    this._file = file;
  }

  get file(): NotebookFile {
    return this._file;
  }

  get path(): string {
    return this._file.path;
  }

  get conflict(): boolean {
    return this._conflict;
  }

  get versions(): Versions {
    return this._versions;
  }

  get conflictState(): ISignal<this, boolean> {
    return this._conflictState;
  }

  setCursorToken(index: number, pos: CodeEditor.IPosition) {
    const json = this.versions.local;
    const source = json.cells[index].source;
    const text = source.split('\n');
    let line = text[pos.line];

    const before = line.slice(0, pos.column);
    const after = line.slice(pos.column);
    line = before + '\n' + this._token + '\n' + after;

    text[pos.line] = line;
    json.cells[index].source = text.join('\n')
    this._versions.local_tok = json;
  }

  addVersion(content: any, origin: 'base' | 'local' | 'remote'): void {
    this._versions[origin] = content;
  }

  async sendInitRequest(): Promise<any> {
    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        path: this.file.git_path,
        file_path: this.path,
      }),
    };

    const response = await requestAPI('v1/nbinit', init);
    if (response.success){
      this._fpath = response.fpath;
      this._dpath = response.dpath;
    } else {
      throw Error(response.error);
    }
  }

  async mergeVersions(): Promise<any> {
    const response = await this._sendMergeRequest();

    if (response.success) { 
      const ret = {
        index: response.index, 
        pos: response.pos
      } 
      return ret;
    } else if (response.conflict) { 
      // TO DO (ashleyswang): return value for conflicts
      await this._resolveConflicts();
      return true; 
    } else { 
      throw Error(response.error); 
    }
  }

  private async _sendMergeRequest() {
    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        path: this.file.git_path,
        fpath: this._fpath,
        dpath: this._dpath,
        local: this.versions.local_tok,
        base: this.versions.base,
        token: this._token
      }),
    };

    const response = await requestAPI('v1/nbmerge', init);
    return response;
  }

  private async _resolveConflicts() {
    // TO DO (ashleyswang): add 3 way merge conflict functionality
    await this._resolveDialog();
  }

  private _updateState(state: boolean){
    if (state != this.conflict){
      this._conflict = state;
      this._conflictState.emit(state);
    }
  }

  private async _sendResolveRequest(origin: 'local' | 'remote' | 'merged'){
    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        path: this.file.git_path,
        fpath: this._fpath,
        dpath: this._dpath,
        origin: origin, 
        token: this._token
      }),
    };

    const response = await requestAPI('v1/nbresolve', init);
    if (response.success){ return true; }
    else{ throw Error(response.error); }
  }

  private async _resolveDialog(): Promise<void> {
    const body = 
      `"${this.path}" has a conflict. Would you like to revert to a previous version?\
      \n(Note that ignoring conflicts will stop git sync.)`;
    // const resolveBtn = Dialog.okButton({ label: 'Resolve Conflicts' });
    const localBtn = Dialog.okButton({ label: 'Revert to Local' });
    const remoteBtn = Dialog.okButton({ label: 'Revert to Remote' });
    const diffBtn = Dialog.okButton({ label: 'View Merged'})
    const ignoreBtn = Dialog.warnButton({ label: 'Ignore Conflict' })
    return showDialog({
      title: 'Merge Conflicts',
      body,
      buttons: [ignoreBtn, remoteBtn, localBtn, diffBtn],
    }).then(async result => {
      if (result.button.label === 'Revert to Local') {
        await this._sendResolveRequest('local');
      }
      if (result.button.label === 'Revert to Remote') {
        await this._sendResolveRequest('remote')
      } 
      if (result.button.label === 'View Merged') {
        await this._sendResolveRequest('merged')
      }
      if (result.button.label === 'Resolve Conflicts') {
        // TO DO (ashleyswang) : open an editor for 3 way merging
      }
      if (result.button.label === 'Ignore') {
        this._updateState(true);
        throw new Error('ConflictError: Unresolved conflicts in repository. Stopping sync procedure.');
      }
    });
  }
}

interface IResult {
  text: string,
  pos: CodeEditor.IPosition,
}
export class TextResolver {
 
  private _token = token();
  private _versions: Versions = {
    base: undefined,
    local: undefined, 
    remote: undefined, 
    local_tok: undefined
  }

  addVersion(content: string, origin: 'base' | 'local' | 'remote'): void {
    this._versions[origin] = content;
  }

  mergeVersions(pos: CodeEditor.IPosition): IResult {
    if (this._versions.base == this._versions.local){
      return undefined;
    }
    this._setCursorToken(pos);
    const merged = merge(this._versions.remote, this._versions.base, this._versions.local_tok);
    if (this._isConflict(merged)) {
      return undefined;
    } else {
      return this._removeCursorToken(merged);
    }
  }

  private _isConflict(merged): boolean {
    return merged.length > 1 || !merged[0] || merged[0].conflict;
  }

  private _setCursorToken(pos: CodeEditor.IPosition): void {
    const text = this._versions.local.split('\n');
    let line = text[pos.line];

    const before = line.slice(0, pos.column);
    const after = line.slice(pos.column);
    line = before + this._token + after;

    text[pos.line] = line;
    this._versions.local_tok = text.join('\n');
  }

  private _removeCursorToken(merged): IResult {
    const text_tok = merged ? merged[0].ok.join('') : '';
    const text_arr = text_tok.split('\n');
    for (let i = 0; i < text_arr.length; i++) {
      if (text_arr[i].indexOf(this._token) > -1) {
        const line = i;
        const column = text_arr[i].indexOf(this._token);
        const pos = { line: line, column: column };
        const text = text_tok.replace(this._token, '');
        return {text: text, pos: pos};
      }
    }
  }

  private async _sendResolveRequest(origin: 'local' | 'remote' | 'merged'){
    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        path: this.file.git_path,
        fpath: this._fpath,
        dpath: this._dpath,
        origin: origin
      }),
    };

    const response = await requestAPI('v1/nbresolve', init);
    if (response.success){ return; }
    else{ throw Error(response.error); }
  }

  private async _resolveDialog(): Promise<void> {
    const body = 
      `"${this.path}" has a conflict. Would you like to revert to a previous version?\
      \n(Note that ignoring conflicts will stop git sync.)`;
    // const resolveBtn = Dialog.okButton({ label: 'Resolve Conflicts' });
    const localBtn = Dialog.okButton({ label: 'Revert to Local' });
    const remoteBtn = Dialog.okButton({ label: 'Revert to Remote' });
    const diffBtn = Dialog.okButton({ label: 'View Merged'})
    const ignoreBtn = Dialog.warnButton({ label: 'Ignore Conflict' })
    return showDialog({
      title: 'Merge Conflicts',
      body,
      buttons: [ignoreBtn, remoteBtn, localBtn, diffBtn],
    }).then(async result => {
      if (result.button.label === 'Revert to Local') {
        await this._sendResolveRequest('local');
      }
      if (result.button.label === 'Revert to Remote') {
        await this._sendResolveRequest('remote')
      } 
      if (result.button.label === 'View Merged') {
        await this._sendResolveRequest('merged')
      }
      if (result.button.label === 'Resolve Conflicts') {
        // TO DO (ashleyswang) : open an editor for 3 way merging
      }
      if (result.button.label === 'Ignore') {
        this._updateState(true);
        throw new Error('ConflictError: Unresolved conflicts in repository. Stopping sync procedure.');
      }
    });
  }
}

