#!/usr/bin/env node

const ipfsProvider = require('ipfs-provider')
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
  const { ipfs, provider } = await getIpfs()
  try {
    await cohost(ipfs, provider, cli.input, cli.flags)
  } catch (error) {
    console.error(error.message || error)
    process.exit(-1)
  }
  if (provider === 'JS_IPFS' && !cli.flags.pin) {
    await ipfs.stop()
    process.exit()
  }
}

function getIpfs () {
  return ipfsProvider({
    tryWebExt: false,
    tryWindow: false,
    tryJsIpfs: true,
    getJsIpfs: () => require('ipfs'),
    jsIpfsOpts: { silent: true }
  })
}

run()
