# IPFS Cohost

A CLI to co-host websites published to IPFS

## Usage

Pass it the list of domains you want to cohost. It finds the CID from the [DNSLink] for that domain, and pins it to yout local IPFS node.

```console
$ ipfs-cohost docs.ipfs.io blog.ipfs.io
Finding DNSLinks for 2 domains
docs.ipfs.io QmXrsvjeZeH6rCzgQSJycKq9fFqNgkptTqYRexzaNy4wx3 6591536
blog.ipfs.io QmR1K3ni44WPaHXjXc8vnjFFqzA2EJ3oJ37EHAPqGWjaRN 24003143
Total size:  30.6 MB
```


[DNSLink]: https://dnslink.io
