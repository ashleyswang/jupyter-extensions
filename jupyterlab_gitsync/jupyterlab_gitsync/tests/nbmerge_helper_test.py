import unittest
import subprocess
import json
from jupyterlab_gitsync.nb_handlers import NotebookMergeHandler
from jupyterlab_gitsync.tests.nbmerge_setup import *

class TestNotebookInit(unittest.TestCase):

  def setUp(self):
    subprocess.call(['mkdir', 'test_files'], cwd='.')
    subprocess.call(['mkdir', 'test_files/.sync_cache'], cwd='.')
    subprocess.call(['mkdir', 'test_files/.sync_cache/init_cache_test'], cwd='.')

  def tearDown(self):
    subprocess.call(['rm', '-r', 'test_files'], cwd='.')

  def test_update_base(self):
    base_og_path = 'test_files/.sync_cache/init_cache_test/merged.ipynb'
    with open(base_og_path, 'w') as b:
      b.write(base_contents)

    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'

    updated_base = NotebookMergeHandler.update_base(None, path, dpath, None)

    self.assertEqual(updated_base, None, msg="update_base exited with non-zero exit code")

    with open('test_files/.sync_cache/init_cache_test/base.ipynb') as b:
      base_ud_contents = b.read()

    self.assertEqual(base_ud_contents, base_contents, msg='merged.ipynb did not successfully copy into base.ipynb')

  def test_update_base_contents(self):
    contents = json.loads(base_contents)

    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'

    updated_base = NotebookMergeHandler.update_base(None, path, dpath, contents)

    self.assertEqual(updated_base, None, msg="update_base did not successfully write to base.ipynb")

    with open('test_files/.sync_cache/init_cache_test/base.ipynb') as b:
      file_contents = json.loads(b.read())

    self.assertEqual(contents, file_contents, msg='input contents did not successfully copy into base.ipynb')

  def test_update_local(self):
    contents = json.loads(local_contents)
    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'

    NotebookMergeHandler.update_local(None, path, dpath, contents)

    with open('test_files/.sync_cache/init_cache_test/local.ipynb') as l:
      file_contents = json.loads(l.read())

    self.assertEqual(contents, file_contents, msg='input contents did not successfully copy into local.ipynb')

  def test_update_remote(self):
    remote_og_path = 'test_files/init_cache_test.ipynb'
    with open(remote_og_path, 'w') as r:
      r.write(remote_contents)

    path = 'test_files'
    fpath = 'init_cache_test.ipynb'
    dpath = '.sync_cache/init_cache_test'

    updated_remote = NotebookMergeHandler.update_remote(None, path, fpath, dpath)

    self.assertEqual(updated_remote, None, msg="update_remote exited with non-zero exit code")

    with open('test_files/.sync_cache/init_cache_test/remote.ipynb') as r:
      remote_ud_contents = r.read()

    self.assertEqual(remote_ud_contents, remote_contents, msg='remote file did not successfully copy into remote.ipynb')

  def test_merge_notebooks(self):
    with open('test_files/.sync_cache/init_cache_test/base.ipynb', 'w') as b:
      b.write(base_contents)
    with open('test_files/.sync_cache/init_cache_test/local.ipynb', 'w') as l:
      l.write(local_contents)
    with open('test_files/.sync_cache/init_cache_test/remote.ipynb', 'w') as r:
      r.write(remote_contents)

    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'

    NotebookMergeHandler.merge_notebooks(None, path, dpath)

    merged_exists = b'merged.ipynb' in subprocess.check_output(['ls', dpath], cwd=path)
    self.assertTrue(merged_exists, msg='nbmerge failed to create new merged file')

    with open('test_files/.sync_cache/init_cache_test/merged.ipynb') as m:
      merged_ud_contents = m.read()

    local_changes = "# This is a change from our LOCAL changes"
    remote_changes = "# This is a comment from a REMOTE change"

    self.assertTrue(local_changes in merged_ud_contents, msg='local changes are not in merged.ipynb')
    self.assertTrue(remote_changes in merged_ud_contents, msg='remote changes are not in merged.ipynb')

  def test_remove_token(self):
    with open('test_files/.sync_cache/init_cache_test/merged.ipynb', 'w') as file:
      file.write(token_contents)

    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'
    token = '/$*TEST_TOKEN*$/'

    index, pos = NotebookMergeHandler.remove_token(None, path, dpath, token)

    print(index, pos)

    self.assertEqual(index, 0, msg='returned active cell index position incorrect')
    self.assertEqual(pos['line'], 3, msg='returned cursor position line incorrect')
    self.assertEqual(pos['column'], 0, msg='returned cursor position column incorrect')

    with open('test_files/.sync_cache/init_cache_test/merged.ipynb', 'r') as file:
      file_contents = json.loads(file.read())
    contents = json.loads(local_contents)
    
    self.assertEqual(contents, file_contents, msg='token was not successfully removed')
      
  def test_update_disk_file(self):
    with open('test_files/.sync_cache/init_cache_test/merged.ipynb', 'w') as m:
      m.write(base_contents)

    path = 'test_files'
    dpath = '.sync_cache/init_cache_test'
    token = '/$*TEST_TOKEN*$/'

    index, pos = NotebookMergeHandler.remove_token(None, path, dpath, token)

    print(index, pos)

    self.assertEqual(index, 0, msg='returned active cell index position incorrect')
    self.assertEqual(pos['line'], 3, msg='returned cursor position line incorrect')
    self.assertEqual(pos['column'], 0, msg='returned cursor position column incorrect')

    with open('test_files/.sync_cache/init_cache_test/merged.ipynb', 'r') as file:
      file_contents = json.loads(file.read())
    contents = json.loads(local_contents)
    
    self.assertEqual(contents, file_contents, msg='token was not successfully removed')
      
  def test_update_disk_file(self):
    with open('test_files/.sync_cache/init_cache_test/merged.ipynb', 'w') as m:
      m.write(base_contents)

    path = 'test_files'
    fpath = 'init_cache_test.ipynb'
    dpath = '.sync_cache/init_cache_test'

    updated_disk_file = NotebookMergeHandler.update_disk_file(None, path, fpath, dpath)

    self.assertEqual(updated_disk_file, None, msg="update_remote exited with non-zero exit code")

    with open('test_files/init_cache_test.ipynb') as og:
      original = og.read()

    self.assertEqual(original, base_contents, msg='remote file did not successfully copy into remote.ipynb')

if __name__ == '__main__':
  unittest.main()
