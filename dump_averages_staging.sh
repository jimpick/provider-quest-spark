#! /bin/bash

for f in `ls -d output-staging/json_avg_power_hourly/date=*/miner\=f02620`; do
  miner=$(echo $f | sed 's,^.*miner=,,')
  echo $miner
  cat $(ls $f/part*.json) | jq -s '[.[] | { start: .window.start, qualityAdjPower: .["avg(qualityAdjPower)"] }] | sort_by(.start)'
done
