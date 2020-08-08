import unittest
import subprocess

def add_cache_folder(path):
    file_exists = not subprocess.call(['ls', '.sync_cache'], cwd=path)
    if not file_exists:
      subprocess.call(['mkdir', '.sync_cache'], cwd=path)

def add_file_cache(path, file_path):
  fpath = file_path[file_path.startswith(path) and len(path)+1:]
  dname = fpath.replace('/', ':').replace('.ipynb','')

  dpath = '.sync_cache/'+dname
  file_exists = not subprocess.call(['ls', dpath], cwd=path)
  if not file_exists:
    subprocess.call(['mkdir', dpath], cwd=path)

  # TO DO (ashleyswang): consider case that dname is
  # another file in repository
  return fpath, dpath

def init_cache_files(path, fpath, dpath):
  """
  Initialize cached folder to start sync process
  * No error checking since prev cache may exist
  @params
    * path  : git repository path relative to server
    * fpath : file path relative to path
    * dpath : cache dir path for file relative to path
  """
  subprocess.call(['cp', fpath, dpath+'/base.ipynb'], cwd=path)
  subprocess.call(['cp', fpath, dpath+'/local.ipynb'], cwd=path)
  subprocess.call(['cp', fpath, dpath+'/remote.ipynb'], cwd=path)
  subprocess.call(['cp', fpath, dpath+'/merged.ipynb'], cwd=path)

class TestNotebookInit(unittest.TestCase):

  def test_add_cache_folder(self):
    path = './test_files'

    add_cache_folder(path)
    cache_folder_exists = not subprocess.call(['ls', '.sync_cache'], cwd=path)

    self.assertTrue(cache_folder_exists, msg="'.sync_cache' directory does not exist")

  def test_add_file_cache(self):
    path = './test_files'
    file_path = './test_files/init_cache_test.ipynb'

    fpath, dpath = add_file_cache(path, file_path)

    self.assertEqual(fpath, 'init_cache_test.ipynb')
    self.assertEqual(dpath, '.sync_cache/init_cache_test')

    file_exists = not subprocess.call(['ls', dpath], cwd=path)
    self.assertTrue(file_exists, msg="directory in '.sync_cache' containing cached files does not exist" )

  def test_init_cache_files(self):
    path = './test_files'
    fpath = 'init_cache_test.ipynb'
    dpath = '.sync_cache/init_cache_test'

    init_cache_files(path, fpath, dpath)

    cache_file_list = subprocess.check_output(['ls', dpath], cwd=path)
    self.assertTrue(b'base.ipynb' in cache_file_list, msg="'base.ipynb' was not created")
    self.assertTrue(b'local.ipynb' in cache_file_list, msg="'local.ipynb' was not created")
    self.assertTrue(b'remote.ipynb' in cache_file_list, msg="'remote.ipynb' was not created")
    self.assertTrue(b'merged.ipynb' in cache_file_list, msg="'merged.ipynb' was not created")

    cache_file_path = './test_files/.sync_cache/init_cache_test/'
    
    with open(cache_file_path+'base.ipynb', 'r') as b:
      base = b.read()
    with open(cache_file_path+'local.ipynb', 'r') as l:
      local = l.read()
    with open(cache_file_path+'remote.ipynb', 'r') as r:
      remote = r.read()
    with open(cache_file_path+'merged.ipynb', 'r') as m: 
      merged = m.read()

    self.assertEqual(base, local, msg="BASE and LOCAL are different")
    self.assertEqual(base, remote, msg="BASE and REMOTE are different")
    self.assertEqual(base, merged, msg="BASE and MERGED are different")

if __name__ == '__main__':
  unittest.main()

