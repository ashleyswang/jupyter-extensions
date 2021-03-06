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
  shell: ILabShell,
  manager: IDocumentManager
) {
  const service = new GitSyncService(shell, manager);
  const widget = new GitSyncWidget(service);
  app.shell.add(widget, 'left', { rank: 100 });
}
/**
 * The JupyterLab plugin.
 */
const GitSyncPlugin: JupyterFrontEndPlugin<void> = {
  id: 'gitsync:gitsync',
  requires: [ILabShell, IDocumentManager],
  activate: activate,
  autoStart: true,
};

/**
 * Export the plugin as default.
 */
export default [GitSyncPlugin];
