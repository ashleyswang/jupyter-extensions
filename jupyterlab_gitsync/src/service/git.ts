import { requestAPI } from './request_api';

/**
 *
 * Class responsible for requesting git handlers on the server side
 * to synchronize local repository with remote repository
 *
 */

export class GitManager {
  // Member Fields
  private _path: string = undefined;
  private _executablePath: string = undefined;
  private _options: {remote: string, worktree: string} = undefined;

  get path(): string {
    return this._path;
  }

  get options(): {remote: string, worktree: string} {
    return this._options;
  }

  async sync() {
    if (this.path && this._executablePath){
      const init: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          path: this._path,
          ex_path: this._executablePath,
          options: [this.options.remote, this.options.worktree],
        }),
      };

      const response = await requestAPI('v1/sync', init);

      if (response.success) {
        return;
      } else if (response.conflict) {
        // TO DO (ashleyswang): add logic for resolving conflicts during sync
        // this._fileConflicts = response.conflict;
        return;
      } else {
        throw Error(response.error);
      }
    }
  }

  async setup(path: string, remote?: string, worktree?: string) {
    this._clearConfig();
    if (remote && worktree){
      this._options = {remote: remote, worktree: worktree};
    }

    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ path: path }),
    };

    const response = await requestAPI('v1/setup', init);
    if (response.ex_path) {
      this._path = path;
      this._executablePath = response.ex_path;
    } else {
      throw Error(response.error);
    }
    console.log(this.path, this.options);
  }

  private _clearConfig() {
    this._path = undefined;
    this._executablePath = undefined;
    this._options = {remote: undefined, worktree: undefined};
  }
}
