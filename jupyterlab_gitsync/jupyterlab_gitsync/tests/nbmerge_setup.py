base_contents = '''
{
  "cells": [
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# This is our base cell\\n",
    "# Other cells should be written around this cell\\n",
    "# We can test merge with additions to base cells\\n",
    "# and adding cells entirely."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\\"Hello, this is a cell from the base version of the file.\\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "",
   "name": ""
  },
  "language_info": {
   "name": ""
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}'''

remote_contents = '''
{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# This is our base cell\\n",
    "# Other cells should be written around this cell\\n",
    "# We can test merge with additions to base cells\\n",
    "# and adding cells entirely.\\n",
    "\\n",
    "# This is a comment from a REMOTE change"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\\"Hello, this is a cell from the base version of the file.\\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\\"This is a change from the REMOTE repository.\\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "",
   "name": ""
  },
  "language_info": {
   "name": ""
  }
 },
 "nbformat": 4, 
 "nbformat_minor": 4
}'''
 
local_contents = '''
{
  "metadata": {
    "kernelspec": {
      "display_name": "",
      "name": ""
    },
    "language_info": {
      "name": ""
    }
  },
  "nbformat_minor": 4,
  "nbformat": 4,
  "cells": [
  {
    "cell_type":"code",
    "source": [
      "# This is a change from our LOCAL changes\\n",
      "\\n",
      "# This is our base cell\\n",
      "# Other cells should be written around this cell\\n",
      "# We can test merge with additions to base cells\\n",
      "# and adding cells entirely."
    ],
    "metadata": {
      "trusted": true
    },
    "execution_count": null,
    "outputs":[]
  },
  {
    "cell_type":"code",
    "source":"print(\\"This is a cell from our LOCAL changes\\")",
    "metadata":{
      "trusted":true
    },
    "execution_count": null,
    "outputs": []
  },
  {
    "cell_type": "code",
    "source":"print(\\"Hello, this is a cell from the base version of the file.\\")",
    "metadata":{
      "trusted":true
    },
    "execution_count":null,
    "outputs": []
  }
  ]
}'''

token_contents = '''
{
  "metadata": {
    "kernelspec": {
      "display_name": "",
      "name": ""
    },
    "language_info": {
      "name": ""
    }
  },
  "nbformat_minor": 4,
  "nbformat": 4,
  "cells": [
  {
    "cell_type":"code",
    "source": [
      "# This is a change from our LOCAL changes\\n",
      "\\n",
      "# This is our base cell\\n",
      "\\n",
      "/$*TEST_TOKEN*$/\\n",
      "# Other cells should be written around this cell\\n",
      "# We can test merge with additions to base cells\\n",
      "# and adding cells entirely."
    ],
    "metadata": {
      "trusted": true
    },
    "execution_count": null,
    "outputs":[]
  },
  {
    "cell_type":"code",
    "source":"print(\\"This is a cell from our LOCAL changes\\")",
    "metadata":{
      "trusted":true
    },
    "execution_count": null,
    "outputs": []
  },
  {
    "cell_type": "code",
    "source":"print(\\"Hello, this is a cell from the base version of the file.\\")",
    "metadata":{
      "trusted":true
    },
    "execution_count":null,
    "outputs": []
  }
  ]
}'''