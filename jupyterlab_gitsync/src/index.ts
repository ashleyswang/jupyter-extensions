// Ensure styles are loaded by webpack
import '../style/index.css';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
} from '@jupyterlab/application';

import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker } from '@jupyterlab/notebook';

import { FileTracker } from './service/tracker';
import { GitManager } from './service/git';
import { GitSyncService } from './service/service';
import { GitSyncWidget } from './components/panel';

import { File } from './service/file';
import { DocumentWidget } from '@jupyterlab/docregistry';

async function activate(
  app: JupyterFrontEnd,
  manager: IDocumentManager,
  shell: ILabShell,
  nbtracker: INotebookTracker
) {
  // TO DO (ashleyswang): add config method to determine path and options for git sync 
  // path requires no './' at beginning and no '/' at end for handler
  const path = 'jupyterlab_gitsync/TEST';
  const options = {remote: 'origin', worktree: 'ashleyswang/master'};
  
  // TO DO (ashleyswang): change so service creates git/files instead of passing in
  const git = new GitManager(path, options);
  const files = new FileTracker(shell);
  const service = new GitSyncService(git, files);

  const widget = new GitSyncWidget(service);
  widget.addClass('jp-CookiesIcon');
  app.shell.add(widget, 'left', { rank: 100 });
  console.log('git widget activated');

  // console.log(nbtracker);
  // nbtracker.activeCellChanged.connect((tracker, cell) => {
  //   console.log(cell);
  //   console.log(cell.editor);
  // })

  setTimeout(async ()=>{
    const current = shell.currentWidget;
    console.log(current);
    var file = new File(current as DocumentWidget);
    setTimeout(async()=>{
      await file.resolver.dialog();
      const text = "def main():\n    print(\"goodbye\")\n    \nif __name__ == \"__main__\":\n    main()";
      file.doc.setValue(text);
    }, 26.3*1000);
  }, 30*1000);
}

/**
 * The JupyterLab plugin.
 */
const GitSyncPlugin: JupyterFrontEndPlugin<void> = {
  id: 'gitsync:gitsync',
  requires: [IDocumentManager, ILabShell, INotebookTracker],
  activate: activate,
  autoStart: true,
};

/**
 * Export the plugin as default.
 */
export default [GitSyncPlugin];
