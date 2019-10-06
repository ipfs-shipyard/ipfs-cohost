#!/usr/bin/env bash

echo "Domain | DNSLink"
echo "-------|--------"

for domain in "$@"
do
  dnslink=`ipfs dns "$domain" 2>/dev/null`

  if [ $? == 0 ]; then
    echo "$domain | $dnslink"
  fi

done
