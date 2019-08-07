const IPFS = require('ipfs')
const prettyBytes = require('pretty-bytes')

module.exports = cohost

async function cohost(input, flags) {
  // console.log({input, flags})
  const longestDomain = input.reduce((a,b) => a.length > b.length ? a.length : b.length, '')
  console.log(`Finding DNSLinks for ${input.length} domain${input.length === 1 ? '' : 's'}`)
  const ipfs = await IPFS.create({silent: true})
  const results = []
  for (domain of input) {
    const address = await ipfs.dns(domain)
    const cid = address.slice(6) // trim off the /ipfs/ prefix...
    const stat = await ipfs.object.stat(cid)
    results.push({domain, cid, stat})
    console.log(domain.padEnd(longestDomain), cid, stat.CumulativeSize)
  }
  const totalBytes = results.map(x => x.stat.CumulativeSize).reduce((a, b) => a + b, 0)
  console.log('Total size: ', prettyBytes(totalBytes))
  await ipfs.stop()
  process.exit()
}
