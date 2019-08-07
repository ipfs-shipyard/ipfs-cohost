#!/usr/bin/env node
'use strict';
const meow = require('meow');
const cohost = require('.');
const cli = meow(`
	Usage
	  $ cohost <input>

	Examples
	  $ cohost docs.ipfs.io
`, {
	flags: {
		size: {
			type: 'boolean',
			alias: 's'
		}
	}
});
/*
{
	input: ['domain.com', 'otherthing.org'],
	flags: {size: true},
	...
}
*/

cohost(cli.input, cli.flags);
