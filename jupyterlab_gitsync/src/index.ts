// Ensure styles are loaded by webpack
import '../style/index.css';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
} from '@jupyterlab/application';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { GitSyncService } from './service/service';
import { GitSyncWidget } from './components/panel';

async function activate(
  app: JupyterFrontEnd,
  manager: IDocumentManager,
  shell: ILabShell,
) {
  // TO DO (ashleyswang): add config method to determine path and options for git sync 
  // path requires no './' at beginning and no '/' at end for handler
  // const path = 'jupyterlab_gitsync/TEST';
  // const options = {remote: 'origin', worktree: 'ashleyswang/master'};
  
  // TO DO (ashleyswang): change so service creates git/files instead of passing in
  // const git = new GitManager(path, options);
  // const files = new FileTracker(shell);
  const service = new GitSyncService(shell);

  const widget = new GitSyncWidget(service);
  widget.addClass('jp-CookiesIcon');
  app.shell.add(widget, 'left', { rank: 100 });
  console.log('git widget activated');
}

/**
 * The JupyterLab plugin.
 */
const GitSyncPlugin: JupyterFrontEndPlugin<void> = {
  id: 'gitsync:gitsync',
  requires: [IDocumentManager, ILabShell],
  activate: activate,
  autoStart: true,
};

/**
 * Export the plugin as default.
 */
export default [GitSyncPlugin];
