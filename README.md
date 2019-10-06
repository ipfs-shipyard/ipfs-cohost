# ipfs-cohost 🌐✨🤝

A CLI to co-host websites published to [IPFS].

If your domain has a [DNSlink] to a CID, then `ipfs-cohost` will let others pin it to their IPFS node.


## Usage

Pass it the list of domains you want to cohost. It finds the CID from the [DNSLink] for that domain, and pins it to your local IPFS node.

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

### Could you do this with a few lines of bash?

Yes. That is how this command started it's life. You do not need `ipfs-cohost` to co-hosts websites; the `ipfs` command can do it all!

```console
$ ipfs object stat /ipns/docs.ipfs.io | grep CumulativeSize
CumulativeSize: 6591536

$ ipfs pin add /ipns/docs.ipfs.io
pinned QmXrsvjeZeH6rCzgQSJycKq9fFqNgkptTqYRexzaNy4wx3 recursively
```

## Install

With `node` >= 10.15 and `npm` > 6.9 installed , you can install `ipfs-cohost` via `npm`

```console
# install it
$ npm i -g ipfs-cohost

# run it
$ ipfs-cohost docs.ipfs.io blog.ipfs.io ipfs.io
```

You can run the latest version of `ipfs-cohost` without explicitly installing it via `npx`

```console
$ npx ipfs-cohost docs.ipfs.io blog.ipfs.io ipfs.io
```


[IPFS]: https://ipfs.io
[DNSLink]: https://dnslink.io
