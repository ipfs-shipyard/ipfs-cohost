# ipfs-cohost 🌐✨🤝

A CLI to co-host websites published to [IPFS].

If your domain has a [DNSlink] to a CID, then `ipfs-cohost` will let others pin it to their IPFS node.

## Usage

Pass it the list of domains you want to cohost. It finds the CID from the [DNSLink] for that domain and starts cohosting the domains. By default, we use a [lazy cohosting]. You can force the domains to be fully cohosted by using the flag `--full`.

```console
$ ipfs-cohost add ipfs.io docs.ipfs.io awesome.ipfs.io
🔌 Using local ipfs daemon via http api
📍 docs.ipfs.io    QmNrbogjGZWgUSrbmHXydwc5b51oJQsBfHA2RkNRVf2ikc 6.86 MB
📍 awesome.ipfs.io QmPHrA6RT2j7bEcBrdeV2z6ZWrchDguw9wBchHPr6VZcFS 7.6 MB
📍 ipfs.io         QmYb3dbymigAPcaiQUgnPxbwgMKjvxVBrrxSvFHwbZLVkq 10 MB
📦 Total size 24.5 MB for 3 domains
🤝 Co-hosting 3 domains via IPFS.
```

Passing the `--silent` options will prevent any logging.

```console
$ ipfs-cohost ipfs.io --silent
```

### Remove cohosted website

You can remove one or more websites at once:

```console
$ ipfs-cohost rm ipfs.io docs.ipfs.io awesome.ipfs.io
🔌 Using local ipfs daemon via http api
✔  ipfs.io no longer cohosted.
✔  docs.ipfs.io no longer cohosted.
✔  awesome.ipfs.io no longer cohosted.
```

### List cohosted websites and snapshots

Use `ls` with no arguments to list the cohosted domains:

```console
$ ipfs-cohost ls
🔌 Using local ipfs daemon via http api
📍 Lazily cohosted domains:
      docs.ipfs.io
      ipfs.io
📍 Fully cohosted domains:
      arewedistributedyet.com
      awesome.ipfs.io
      ipfs.io
```

Use `ls` with domains as arguments to list the snapshots for each domain:

```console
$ ipfs-cohost awesome.ipfs.io
🔌 Using local ipfs daemon via http api
⏱ Full snapshots for ipfs.io:
      2019-10-06_095057
      2019-10-05_135342
```

### Sync the current domains

Check if you have the most up to date version of each website and updates the snapshots.

```console
$ ipfs-cohost sync
🔌 Using local ipfs daemon via http api
✔  Snapshots synced!
```

### Prune

Delete all snapshots but the last `n`. If `n` is not provided, all snapshots will be deleted.

```console
$ ipfs-cohost prune [n]
🔌 Using local ipfs daemon via http api
✔  Cohosted websites cleaned!
```

### Could you do these with a few lines of bash?

Yes. All of this commands can be reproducible via bash commands. Please take a look at the [cohosting SPEC](https://github.com/ipfs-shipyard/cohosting/blob/master/SPEC.md) to know which `ipfs` commands are equivalent to these ones.

## Install

With `node` >= 10.15 and `npm` > 6.9 installed , you can install `ipfs-cohost` via `npm`

```console
# install it
$ npm i -g ipfs-cohost

# run it
$ ipfs-cohost add docs.ipfs.io blog.ipfs.io ipfs.io
```

You can run the latest version of `ipfs-cohost` without explicitly installing it via `npx`

```console
$ npx ipfs-cohost add docs.ipfs.io blog.ipfs.io ipfs.io
```

[IPFS]: https://ipfs.io
[DNSLink]: https://dnslink.io
[lazy cohosting]: https://github.com/ipfs-shipyard/cohosting/blob/master/SPEC.md#lazy-and-full-cohosting
