#!/usr/bin/env bash

for domain in "$@"
do
  dnslink=`ipfs dns "$domain" 2>/dev/null`

  if [ $? == 0 ]; then
    size=`ipfs object stat $dnslink --human | grep CumulativeSize | sed 's/CumulativeSize: //'`
    echo "$domain $size"
    # echo "$domain - ipfs pin add $dnslink"
    #ipfs pin add "$dnslink"
  fi

done
