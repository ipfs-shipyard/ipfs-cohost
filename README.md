# ipfs-cohost 🌐✨🤝

A CLI to co-host websites published to IPFS.

## Usage

Pass it the list of domains you want to cohost. It finds the CID from the [DNSLink] for that domain, and pins it to your local IPFS node.

```console
$ ipfs-cohost ipfs.io docs.ipfs.io awesome.ipfs.io
🔌 Using local ipfs daemon via http api
🔍 Finding DNSLinks for 3 domains
🔗 ipfs.io         QmXZz6vQTMiu6UyGxVgpLB6xJdHvvUbhdWagJQNnxXAjpn 11.5 MB
🔗 docs.ipfs.io    QmXrsvjeZeH6rCzgQSJycKq9fFqNgkptTqYRexzaNy4wx3 6.59 MB
🔗 awesome.ipfs.io QmdgXaAryZpe3vQcHyhzk5kowbgxvY3XaGTYvYAhoBrHLm 7.45 MB
📦 Total size 25.6 MB for 3 domains
📍 Pinned ipfs.io
📍 Pinned docs.ipfs.io
📍 Pinned awesome.ipfs.io
🤝 Co-hosting 3 domains via IPFS.
```

Passing the `--no-pin` flag you can find the total size but skip pinning it.

```console
$ ipfs-cohost dist.ipfs.io tr.wikipedia-on-ipfs.org --no-pin
🔌 Using local ipfs daemon via http api
🔍 Finding DNSLinks for 2 domains
🔗 dist.ipfs.io             QmVJL1ew9ytqZGR7Tg121tHEXPwbYVNxzHked3QzVgWEzD 10.6 GB
🔗 tr.wikipedia-on-ipfs.org QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX 14.9 GB
📦 Total size 25.5 GB for 2 domains
```

Passing the `--silent` options will prevent any logging.

```console
$ ipfs-cohost ipfs.io --silent
```

## Install

With `node` >= 10.15 and `npm` > 6.9 installed , you can install `ipfs-cohost` via `npm`

```
# install it
$ npm i -g ipfs-cohost

# run it
$ ipfs-cohost docs.ipfs.io blog.ipfs.io ipfs.io
```

You can run the latest version of `ipfs-cohost` without explicitly installing it via `npx`

```console
$ npx ipfs-cohost docs.ipfs.io blog.ipfs.io ipfs.io
```


[DNSLink]: https://dnslink.io
