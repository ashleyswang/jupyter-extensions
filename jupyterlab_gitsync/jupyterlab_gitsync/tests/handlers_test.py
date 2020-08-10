import unittest
from unittest.mock import Mock, MagicMock, patch

from jupyterlab_gitsync import handlers

def create_test_app():
  app = tornado.web.Application()
  host_pattern = '.*$'
  app.add_handlers(host_pattern, [
    ('/sync', SyncHandler),
    ('/setup', SetupHandler),
    ('/nbinit', NotebookInitHandler),
    ('/nbmerge', NotebookMergeHandler)
  ])
  return app

class TestNotebookInitHandler(tornado.testing.AsyncHTTPTestCase):

  def get_app(self): 
    return create_test_app()

  # TO DO (ashleyswang): create test for handler full functionality

class TestNotebookMergeHandler(tornado.testing.AsyncHTTPTestCase):

  def get_app(self): 
    return create_test_app()

  # TO DO (ashleyswang): create test for handler full functionality

if __name__ == '__main__':
  unittest.main()
