#!/usr/bin/env bash

for domain in "$@"
do
  dnslink=`ipfs dns "$domain" 2>/dev/null`

  if [ $? == 0 ]; then
    # echo "$domain - ipfs pin add $dnslink"
    # ipfs pin add "$dnslink"
    ipfs object stat $dnslink --human | grep CumulativeSize
  fi

done
