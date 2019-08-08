# ipfs-cohost

A CLI to co-host websites published to IPFS

## Usage

Pass it the list of domains you want to cohost. It finds the CID from the [DNSLink] for that domain, and pins it to your local IPFS node.

```console
⨎ ipfs-cohost docs.ipfs.io blog.ipfs.io
🔌 Using local ipfs daemon via http api
🔍 Finding DNSLinks for 2 domains
🔗 docs.ipfs.io QmXrsvjeZeH6rCzgQSJycKq9fFqNgkptTqYRexzaNy4wx3 6.59 MB
🔗 blog.ipfs.io QmenXZSWMe6Gbg8DUqKTJXfC4F6ZRnyAbmUHUBuXAtMG6e 24 MB
📦 Total size 30.6 MB for 2 domains
📍 Pinning docs.ipfs.io
📍 Pinning blog.ipfs.io
🤝 Co-hosting 2 domains via IPFS.
```


[DNSLink]: https://dnslink.io
