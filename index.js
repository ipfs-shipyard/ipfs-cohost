const prettyBytes = require('pretty-bytes')
const ipfsProvider = require('ipfs-provider')

module.exports = cohost

async function cohost (input, flags) {
  const log = logger.bind(null, flags.silent)
  const { ipfs, provider } = await getIpfs()
  const longestDomain = input.reduce((a, b) => a.length > b.length ? a.length : b.length, '')
  log('🔌 Using', provider === 'IPFS_HTTP_API' ? 'local ipfs daemon via http api' : 'js-ipfs node')
  if (input.length > 1) {
    log(`🔍 Finding DNSLinks for ${input.length} domains`)
  }
  const results = []
  for (const domain of input) {
    const address = await ipfs.dns(domain)
    const cid = address.slice(6) // trim off the /ipfs/ prefix... TODO: js-ipfs should deal.
    const stat = await ipfs.object.stat(cid)
    results.push({ domain, cid, stat })
    log('🔗', domain.padEnd(longestDomain), cid, stat.CumulativeSize)
  }
  const totalBytes = results.map(x => x.stat.CumulativeSize).reduce((a, b) => a + b, 0)
  log('📦 Total size:', prettyBytes(totalBytes))

  if (flags.pin) {
    for (const res of results) {
      log(`📍 Pinning ${res.domain}`)
      await ipfs.pin.add(res.cid)
    }
  }
  log(`🤝 Co-hosting ${results.length} domains via IPFS.`)
  if (provider === 'JS_IPFS') {
    log(`💡 Leave this command running to continue co-hosting`)
  }
}

function logger (silent, ...args) {
  if (silent) return
  console.log(args.join(' '))
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
