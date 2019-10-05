#!/usr/bin/env node

const ipfsProvider = require('ipfs-provider')
const meow = require('meow')
const cohost = require('.')
const ora = require('ora')
const cli = meow(`
  Usage
    $ ipfs-cohost <domain>...
    $ ipfs-cohost add <domain>...
    $ ipfs-cohost rm <domain>...
    $ ipfs-cohost ls [domain]...
    $ ipfs-cohost sync
    $ ipfs-cohost gc [n]

  Example
    $ ipfs-cohost docs.ipfs.io cid.ipfs.io

  Options
    --silent, -s  Just do your job
`, {
  flags: {
    silent: {
      type: 'boolean',
      default: false,
      alias: 's'
    }
  }
})

async function add (ipfs, input, silent) {
  let spinner
  for (const domain of input) {
    if (!silent) spinner = ora({ text: `Cohosting ${domain}...` }).start()
    await cohost.add(ipfs, domain)
    if (!silent) spinner.succeed(`${domain} cohosted!`)
  }
}

async function rm (ipfs, input, silent) {
  let spinner
  for (const domain of input) {
    if (!silent) spinner = ora({ text: `Stopping to cohost ${domain}...` }).start()
    await cohost.rm(ipfs, domain)
    if (!silent) spinner.succeed(`${domain} no longer cohosted!`)
  }
}

async function ls (ipfs, input) {
  if (input.length > 0) {
    for (const domain of input) {
      const snapshots = await cohost.ls(ipfs, domain)
      console.log(`Snapshots for ${domain}:`)
      snapshots.forEach(n => console.log(` - ${n}`))
      console.log('')
    }

    return
  }

  console.log('Cohosted domains:')
  const domains = await cohost.ls(ipfs)
  domains.forEach(n => console.log(` - ${n}`))
}

async function sync (ipfs, silent) {
  let spinner
  if (!silent) spinner = ora({ text: 'Syncing snapshots...' }).start()
  await cohost.sync(ipfs)
  if (!silent) spinner.succeed('Snapshots synced!')
}

async function gc (ipfs, input, silent) {
  let num = null
  if (input.length > 0) num = parseInt(input[0], 10)

  let spinner
  if (!silent) spinner = ora({ text: 'Cleaning cohosted websites...' }).start()
  await cohost.gc(ipfs, num)
  if (!silent) spinner.succeed('Cohosted websites cleaned!')
}

async function run () {
  if (cli.input.length === 0) {
    return cli.showHelp()
  }

  const cmd = cli.input.shift()
  const input = cli.input

  const { ipfs, provider } = await getIpfs()

  try {
    switch (cmd) {
      case 'add':
        await add(ipfs, input, cli.flags.silent)
        break
      case 'rm':
        await rm(ipfs, input, cli.flags.silent)
        break
      case 'ls':
        await ls(ipfs, input)
        break
      case 'sync':
        await sync(ipfs, cli.flags.silent)
        break
      case 'gc':
        await gc(ipfs, input, cli.flags.silent)
        break
      default:
        await add(ipfs, input.concat(cmd), cli.flags.silent)
    }
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
