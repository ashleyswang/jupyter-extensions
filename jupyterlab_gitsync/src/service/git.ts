import { requestAPI } from './request_api';
import { ISignal, Signal } from '@lumino/signaling';

/**
 *
 * Class responsible for requesting git handlers on the server side
 * to synchronize local repository with remote repository
 *
 */

export class GitManager {
  // Member Fields
  private _path: string = '.';
  private _currBranch: string = undefined;
  private _collab: boolean = true;
  private _executablePath: string = undefined;
  private _branches: string[] = [];

  private _setupChange: Signal<this, string> = new Signal<this, string>(this);

  get path(): string {
    return this._path;
  }

  set path(path: string) {
    if (path != this.path){ this.setup(path); }
  }

  get currBranch(): string {
    return this._currBranch;
  }

  set currBranch(branch: string) {
    if (branch != this.currBranch){
      const create = (branch in this.branches);
      this.change_branch(branch, create);
    }
  }

  get collab(): boolean {
    return this._collab;
  }

  set collab(collab: boolean) {
    this._collab = collab;
  }

  get options(): string[] {
    return (this.collab) ? ['origin', 'jp-shared/'+this.currBranch] : []
  }

  get branches(): string[] {
    return this._branches;
  }

  get setupChange(): ISignal<this, string> {
    return this._setupChange;
  }

  async change_branch(branch: string, create: boolean) {
    this._setupChange.emit('start');
    if (this.path && this._executablePath){
      const init: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          path: this._path,
          branch: branch, 
          create: create
        }),
      };

      const response = await requestAPI('v1/branch', init);

      if (response.success) {
        this._currBranch = branch
        this._branches.push(branch);
        this._setupChange.emit('finish');
      } else {
        throw Error(response.error);
      }
    }
  }

  async sync() {
    if (this.path && this._executablePath){
      const init: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          path: this._path,
          ex_path: this._executablePath,
          collab: this.collab,
        }),
      };

      const response = await requestAPI('v1/sync', init);

      if (response.success) {
        if (response.curr_branch !== this.currBranch){
          this._currBranch = response.curr_branch;
          this._setupChange.emit('change');
        }
      } else if (response.conflict) {
        // TO DO (ashleyswang): add logic for resolving conflicts during sync
        // this._fileConflicts = response.conflict;
        return;
      } else {
        throw Error(response.error);
      }
    }
  }

  async setup(path: string) {
    this._setupChange.emit('start');
    this._clearConfig();

    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ path: path }),
    };

    const response = await requestAPI('v1/setup', init);
    if (response.ex_path) {
      this._path = path;
      this._executablePath = response.ex_path;
      this._branches = response.branches;
      this._currBranch = response.curr_branch;

      this._setupChange.emit('finish');
    } else {
      throw Error(response.error);
    }
    console.log(this.path, this.options);
  }

  private _clearConfig() {
    this._path = undefined;
    this._executablePath = undefined;
  }
}
