function getTimestamp () {
  return new Date().toISOString()
    .replace(/:/g, '')
    .replace('T', '_')
    .split('.')[0]
}

async function add (ipfs, domain) {
  const cid = await ipfs.resolve(`/ipns/${domain}`)
  const path = `/cohosting/${domain}`

  // Create with parents if it is the first time
  await ipfs.files.mkdir(path, { parents: true })
  const dirs = await ipfs.files.ls(path)
  const latest = dirs.map(file => file.name).sort().pop()

  if (latest) {
    const path = `/cohosting/${domain}/${latest}`
    const stat = await ipfs.files.stat(path)

    if (`/ipfs/${stat.hash}` === cid) {
      const newPath = `/cohosting/${domain}/${getTimestamp()}`
      await ipfs.files.mv([path, newPath])
      return ipfs.files.stat(newPath)
    }
  }

  const newPath = `/cohosting/${domain}/${getTimestamp()}`
  await ipfs.refs(cid, { recursive: true })
  await ipfs.files.cp([cid, newPath])
  return ipfs.files.stat(newPath)
}

async function rm (ipfs, domain) {
  await ipfs.files.rm(`/cohosting/${domain}`, { recursive: true })
}

async function ls (ipfs, domain = null) {
  let path = '/cohosting'
  if (domain) path += `/${domain}`

  return (await ipfs.files.ls(path)).map(file => file.name).sort()
}

async function sync (ipfs) {
  await ipfs.files.stat('/cohosting')
  const files = await ipfs.files.ls('/cohosting')
  const domains = files.map(file => file.name)

  for (const domain of domains) {
    await add(ipfs, domain)
  }
}

async function gc (ipfs, count = null) {
  const domains = await ls(ipfs)

  for (const domain of domains) {
    if (count !== null) {
      const snapshots = await ls(ipfs, domain)
      const toRemove = snapshots.reverse().slice(count)

      for (const snap of toRemove) {
        await ipfs.files.rm(`/cohosting/${domain}/${snap}`, { recursive: true })
      }
    } else {
      await rm(ipfs, domain)
      await ipfs.files.mkdir(`/cohosting/${domain}`, { parents: true })
    }
  }
}

module.exports = {
  add,
  rm,
  ls,
  sync,
  gc
}
