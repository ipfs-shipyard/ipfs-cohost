#!/usr/bin/env node

const ipfsProvider = require('ipfs-provider')
const meow = require('meow')
const cohost = require('.')
const ora = require('ora')
const prettyBytes = require('pretty-bytes')

let log = null
let spin = null

const cli = meow(`
  Usage
    $ ipfs-cohost <domain>...
    $ ipfs-cohost add <domain>... [--lazy] [--full]
    $ ipfs-cohost rm <domain>... [--all]
    $ ipfs-cohost ls [domain]...
    $ ipfs-cohost mv [domain]... [--lazy] [--full]
    $ ipfs-cohost sync
    $ ipfs-cohost prune [n]

  Example
    $ ipfs-cohost docs.ipfs.io cid.ipfs.io

  Options
    --silent, -s  Just do your job
    --full        Fully cohost a website
    --lazy        Lazily cohost a website (default)
    --all         Remove all cohosted websites (lazy AND full)
`, {
  flags: {
    silent: {
      type: 'boolean',
      default: false,
      alias: 's'
    },
    full: {
      type: 'boolean'
    },
    lazy: {
      type: 'boolean'
    },
    all: {
      type: 'boolean'
    }
  }
})

async function add (ipfs, input) {
  const longestDomain = input.reduce((r, c) => r.length >= c.length ? r : c)
  let size = 0
  for (const domain of input) {
    const spinner = spin(`Cohosting ${domain}...`)
    const { hash, cumulativeSize } = await cohost.add(ipfs, domain, {
      lazy: !cli.flags.full
    })
    spinner.stop()
    size += cumulativeSize
    log('📍', domain.padEnd(longestDomain.length), hash, prettyBytes(cumulativeSize))
  }
  log('📦', 'Total size', prettyBytes(size), 'for', input.length, 'domains')
  log('🤝', 'Co-hosting', input.length, 'domains via IPFS.')
}

async function rm (ipfs, input) {
  let spinner

  if (cli.flags.all) {
    spinner = spin('Removing all cohosted websites...')
    await cohost.rmAll(ipfs)
    spinner.succeed('All cohosted websites removed.')
    return
  }

  for (const domain of input) {
    spinner = spin(`Stopping to cohost ${domain}...`)
    await cohost.rm(ipfs, domain)
    spinner.succeed(` ${domain} no longer cohosted.`)
  }
}

async function ls (ipfs, input) {
  if (input.length > 0) {
    for (const domain of input) {
      const { lazy, full } = await cohost.ls(ipfs, domain)
      if (lazy.length > 0) {
        log(`⏱  Lazy snapshots for ${domain}:`)
        lazy.forEach(n => log(`      ${n}`))
      }

      if (full.length > 0) {
        log(`⏱  Full snapshots for ${domain}:`)
        full.forEach(n => log(`      ${n}`))
      }
    }

    return
  }

  const { lazy, full } = await cohost.ls(ipfs)
  if (lazy.length > 0) {
    log('📍 Lazily cohosted domains:')
    lazy.forEach(n => log(`      ${n}`))
  }

  if (full.length > 0) {
    log('📍 Fully cohosted domains:')
    full.forEach(n => log(`      ${n}`))
  }
}

async function sync (ipfs) {
  const spinner = spin('Syncing snapshots...')
  await cohost.sync(ipfs)
  spinner.succeed(' Snapshots synced!')
}

function printSnapshots (snap) {
  for (const { domain, snapshots } of snap) {
    log(`      ${domain}`)
    snapshots.forEach(n => log(`            ${n}`))
  }
}

async function prune (ipfs, input) {
  let num = 1
  if (input.length > 0) num = parseInt(input[0], 10)

  const spinner = spin('Cleaning cohosted websites...')
  const { lazy, full } = await cohost.prune(ipfs, num)
  spinner.succeed(' Cohosted websites cleaned!')

  if (lazy.length > 0) {
    log('⏱  Lazy snapshots pruned:')
    printSnapshots(lazy)
  }

  if (full.length > 0) {
    log('⏱  Full snapshots pruned:')
    printSnapshots(full)
  }
}

async function mv (ipfs, input) {
  for (const domain of input) {
    await cohost.mv(ipfs, domain, { lazy: !cli.flags.full })
    log(`📍 ${input} now ${cli.flags.full ? 'fully' : 'lazily'} cohosted!`)
  }
}

async function run () {
  if (cli.input.length === 0) {
    return cli.showHelp()
  }

  const cmd = cli.input.shift()
  const input = cli.input

  const { ipfs, provider } = await getIpfs()
  log = logger.bind(null, cli.flags.silent)
  spin = spinner.bind(null, cli.flags.silent)

  if (!cli.flags.silent) {
    log('🔌 Using', provider === 'IPFS_HTTP_API' ? 'local ipfs daemon via http api' : 'js-ipfs node')
  }

  try {
    switch (cmd) {
      case 'add':
        await add(ipfs, input)
        break
      case 'rm':
        await rm(ipfs, input)
        break
      case 'ls':
        await ls(ipfs, input)
        break
      case 'sync':
        await sync(ipfs)
        break
      case 'prune':
        await prune(ipfs, input)
        break
      case 'mv':
        await mv(ipfs, input)
        break
      default:
        await add(ipfs, input.concat(cmd))
    }
  } catch (error) {
    console.error(error.message || error)
    process.exit(-1)
  }

  if (provider === 'JS_IPFS') {
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

function spinner (silent, text) {
  if (silent) return { stop: () => {}, fail: () => {}, succeed: () => {} }
  return ora({ text: ` ${text}`, spinner: 'dots' }).start()
}

function logger (silent, ...args) {
  if (silent) return
  console.log(args.join(' '))
}

run()
