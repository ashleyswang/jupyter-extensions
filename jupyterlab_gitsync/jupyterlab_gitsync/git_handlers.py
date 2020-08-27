import json
import tornado.gen as gen
import os
import subprocess

from notebook.base.handlers import APIHandler

class BranchHandler(APIHandler):
  """ 
  Allows users to switch to an existing branch
  or create and switch to a new branch
  """
  def create_branch(self, path, branch):
    assert subprocess.call(['git', 'branch', branch], cwd=path) == 0, "Branch {} could not be created. Please check that the branch name does not exist.".format(branch)

  def change_branch(self, path, branch):
    assert subprocess.call(['git', 'checkout', branch], cwd=path) == 0, "Could not switch to branch {}. Please commit or stash your changes and try again. ".format(branch)

  @gen.coroutine
  def post(self, *args, **kwargs):
    recv = self.get_json_body()
    path = recv['path'] if recv['path'] else '.'
    branch = recv['branch']
    create = recv['create']

    try: 
      if (create):
        self.create_branch(path, branch)
      self.change_branch(path, branch)
      self.finish({'success': True})
    except Exception as e:
      self.finish({'error': str(e)})

class SyncHandler(APIHandler):

  """
  Implements all synchronization operations
  * uses git-sync-changes bash script
  """
  def get_current_branch(self, path):
    res = subprocess.run(['git', 'branch'], cwd=path, capture_output=True)
    branches = [x.decode("utf-8") for x in res.stdout.split() if (x!=b'*')]
    curr_index = res.stdout.split().index(b'*')
    return branches[curr_index]

  @gen.coroutine
  def post(self, *args, **kwargs):
    recv = self.get_json_body()
    path = recv['path'] if recv['path'] else '.'
    ex_path = recv['ex_path'] if recv['ex_path'] else ['git', 'sync-changes']
    curr_branch = self.get_current_branch(path)
    options = ['origin', 'jp-shared/'+curr_branch] if recv['collab'] else [] 

    try:
      return_code = subprocess.call([ex_path]+options, cwd=path)
      if return_code == 0:
        self.finish({'success': True, 'curr_branch': curr_branch})
      else:
        self.finish({'conflict': True})
    except Exception as e:
      self.finish({'error': str(e)})


class SetupHandler(APIHandler):

  """
  Sets up environment for extension to run
  * verify that working path is a git repo
  * sets up `.sync_cache` folder if none exists
  * returns executable path for sync
  """

  def inside_git_repo(self, path):
    return_code = subprocess.call(['git', 'rev-parse'], cwd=path)
    return return_code == 0

  def get_sync_path(self):
    cwd = os.getcwd()
    ex_path = 'jupyterlab_gitsync/jupyterlab_gitsync/git-sync-changes/git-sync-changes'
    return os.path.join(cwd, ex_path)

  def get_current_branch(self, path):
    res = subprocess.run(['git', 'branch'], cwd=path, capture_output=True)
    branches = [x.decode("utf-8") for x in res.stdout.split() if (x!=b'*')]
    curr_index = res.stdout.split().index(b'*')
    return branches[curr_index], branches

  @gen.coroutine
  def post(self, *args, **kwargs):
    recv = self.get_json_body()
    path = recv['path'] if recv['path'] else '.'

    try:
      if self.inside_git_repo(path):
        curr_branch, branches = self.get_current_branch(path)
        ex_path = self.get_sync_path()
        self.finish({'ex_path': ex_path, 'curr_branch': curr_branch, 'branches': branches})
      else:
        self.finish({'error': 'Given path is not a git repository.'})
    except Exception as e:
      self.finish({'error': str(e)})
