GitHub Commit hook to run JSLint
================================

This is a port of https://github.com/wbecker/dvcs_hook-jslint-node with a few changes:

* Properly detect renames
* Don't read "foo.json" as "foo.js"
* Don't check files twice
* Properly escape file names
* Wait before exiting to let the buffer flush (maybe only an issue on XP)
* Don't give up on the first JSLint error

Requirements
============

* [Node.js](http://nodejs.org/)
* NPM module jslint

Standard version of jslint:

	npm install jslint
  
Brackets compatible version of jslint:
	
	npm install git+https://github.com/DennisKehrig/node-jslint.git

Template for **.git/hooks/pre-commit**:

	#!/bin/sh
	exec node /path/to/dvcs_jslint.js /path/to/node_modules/jslint/bin/jslint.js git

