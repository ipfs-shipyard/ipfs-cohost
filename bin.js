#!/usr/bin/env node
'use strict'
const meow = require('meow')
const cohost = require('.')
const cli = meow(`
  Usage
    $ ipfs-cohost <domain 1> <domain 2>...

  Example
    $ ipfs-cohost docs.ipfs.io cid.ipfs.io

  Options
    --no-pin, Find the cumlative sizes but dont pin them
    --silent, -s  Just do your job
`, {
  flags: {
    pin: {
      type: 'boolean',
      default: true
    },
    silent: {
      type: 'boolean',
      default: false,
      alias: 's'
    }
  }
})

/*
{
  input: ['domain.com', 'otherthing.org'],
  flags: {pin: true, silent: false},
  ...
}
*/
async function run () {
  if (cli.input.length === 0) {
    return cli.showHelp()
  }
  try {
    await cohost(cli.input, cli.flags)
  } catch (error) {
    console.error(error.message || error)
    process.exit(-1)
  }
}

run()
