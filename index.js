'use strict'

function getTimestamp () {
  return new Date().toISOString()
    .replace(/:/g, '')
    .replace('T', '_')
    .split('.')[0]
}

function getOptions (opts) {
  opts = opts || {}
  opts = Object.assign({
    lazy: true
  }, opts)
  return opts
}

async function fileExists (ipfs, path) {
  try {
    await ipfs.files.stat(path)
    return true
  } catch (_) {
    return false
  }
}

async function isLazilyCohosted (ipfs, domain) {
  return fileExists(ipfs, `/cohosting/lazy/${domain}`)
}

async function isFullyCohosted (ipfs, domain) {
  return fileExists(ipfs, `/cohosting/full/${domain}`)
}

async function add (ipfs, domain, opts) {
  opts = getOptions(opts)

  const cid = await ipfs.resolve(`/ipns/${domain}`)
  const path = `/cohosting/${opts.lazy ? 'lazy' : 'full'}/${domain}`

  // Create with parents if it is the first time
  await ipfs.files.mkdir(path, { parents: true })
  const dirs = await ipfs.files.ls(path)
  const latest = dirs.map(file => file.name).sort().pop()

  if (latest) {
    const latestPath = `${path}/${latest}`
    const stat = await ipfs.files.stat(latestPath)

    if (`/ipfs/${stat.hash}` === cid) {
      const newPath = `${path}/${getTimestamp()}`
      await ipfs.files.mv([latestPath, newPath])
      return ipfs.files.stat(newPath)
    }
  }

  const newPath = `${path}/${getTimestamp()}`
  await ipfs.files.cp([cid, newPath])

  // If we're not cohosting lazily, then load the full contents
  // of the website.
  if (!opts.lazy) {
    if (opts.fetchInBackground) {
    	ipfs.refs(cid, { recursive: true })
	} else {
		await ipfs.refs(cid, { recursive: true })
	}
  }

  return ipfs.files.stat(newPath)
}

async function rm (ipfs, domain) {
  if (await isLazilyCohosted(ipfs, domain)) {
    await ipfs.files.rm(`/cohosting/lazy/${domain}`, { recursive: true })
  }

  if (await isFullyCohosted(ipfs, domain)) {
    await ipfs.files.rm(`/cohosting/full/${domain}`, { recursive: true })
  }
}

async function ls (ipfs, domain = null) {
  let lazyPath = '/cohosting/lazy'
  let fullPath = '/cohosting/full'

  if (domain) {
    lazyPath += `/${domain}`
    fullPath += `/${domain}`
  }

  // We test if a certain domain is both lazily and fully
  // cohosted. On normal situations, only one should return true.
  // However, if the user has modified the directory by themselves
  // it may happen we have a domain on both, so we return all
  // entries.

  const lazy = await ipfs.files.ls(lazyPath).catch(_ => [])
  const full = await ipfs.files.ls(fullPath).catch(_ => [])

  return {
    lazy: lazy.map(f => f.name).sort(),
    full: full.map(f => f.name).sort()
  }
}

async function sync (ipfs) {
  const domains = await ls(ipfs)

  for (const type in domains) {
    for (const domain of domains[type]) {
      await add(ipfs, domain, { lazy: type === 'lazy' })
    }
  }
}

async function gc (ipfs, count = null) {
  const { lazy, full } = await ls(ipfs)
  const domains = Array.from(new Set(lazy.concat(full)))

  for (const domain of domains) {
    if (count !== null) {
      const { lazy, full } = await ls(ipfs, domain)
      const allSnapshots = lazy.concat(full).sort().reverse()
      const toRemove = allSnapshots.slice(count)

      for (const snap of toRemove) {
        if (lazy.includes(snap)) {
          await ipfs.files.rm(`/cohosting/lazy/${domain}/${snap}`, { recursive: true })
        } else {
          await ipfs.files.rm(`/cohosting/full/${domain}/${snap}`, { recursive: true })
        }
      }
    } else {
      await rm(ipfs, domain)
      // On this case, we "self-heal" the repository. If there was a 'full' and a 'lazy' entry
      // for a certain domain, only the full (the strongest) will remain created.
      await ipfs.files.mkdir(`/cohosting/${full.includes(domain) ? 'full' : 'lazy'}/${domain}`, { parents: true })
    }
  }
}

async function mv (ipfs, domain, opts) {
  opts = getOptions(opts)
  const lazy = `/cohosting/lazy/${domain}`
  const full = `/cohosting/full/${domain}`

  if (await isLazilyCohosted(ipfs, domain) && !opts.lazy) {
    await ipfs.files.mv([lazy, full])
  }

  if (await isFullyCohosted(ipfs, domain) && opts.lazy) {
    await ipfs.files.mv([full, lazy])
  }
}

module.exports = {
  add,
  rm,
  ls,
  sync,
  gc,
  mv
}
