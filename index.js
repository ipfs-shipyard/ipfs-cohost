const ora = require('ora')
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
    const spinner = getSpinner(domain)
    try {
      const address = await ipfs.dns(domain)
      const cid = address.slice(6) // trim off the /ipfs/ prefix... TODO: js-ipfs should deal.
      const stat = await ipfs.object.stat(cid)
      results.push({ domain, cid, stat })
      spinner.stop()
      log('🔗', domain.padEnd(longestDomain), cid, prettyBytes(stat.CumulativeSize))
    } catch (error) {
      if (error.message === 'could not resolve name' || error.code === 'ENODATA') {
        log('⚠️ ', domain.padEnd(longestDomain), 'has no DNSLink TXT record')
      } else if (error.message === 'not a valid domain name' || error.code === 'ENOTFOUND') {
        log('⚠️ ', domain.padEnd(longestDomain), 'is not a valid domain')
      } else {
        log('⚠️ ', domain.padEnd(longestDomain), error.message || error)
      }
    }
  }
  const totalBytes = results.map(x => x.stat.CumulativeSize).reduce((a, b) => a + b, 0)
  log(`📦 Total size`, prettyBytes(totalBytes), `for ${results.length} domains`)

  if (flags.pin) {
    for (const res of results) {
      const spinner = getSpinner(`Pinning ${res.domain}`)
      await ipfs.pin.add(res.cid)
      spinner.stop()
      log(`📍 Pinned ${res.domain}`)
    }
    log(`🤝 Co-hosting ${results.length} domains via IPFS.`)
  }
  if (provider === 'JS_IPFS') {
    log(`💡 Leave this command running to continue co-hosting`)
  }
}

function logger (silent, ...args) {
  if (silent) return
  console.log(args.join(' '))
}

function getSpinner (text) {
  return ora({ text: ` ${text}`, spinner: 'dots' }).start()
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
