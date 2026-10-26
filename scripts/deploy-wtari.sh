#!/bin/sh
# Deploys subgraph.wtari.yaml for one network as wtari-bridge-<network>.
# Usage: deploy-wtari.sh <studio|goldsky> [--] --network <name> [--version <label>]
# --version is required for goldsky; studio prompts for it when omitted.
set -eu

target=$1
shift
network=""
version=""
while [ $# -gt 0 ]; do
  case "$1" in
    --) shift ;;
    --network) network=$2; shift 2 ;;
    --version) version=$2; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$network" ]; then
  echo "usage: deploy-wtari.sh <studio|goldsky> --network <name> [--version <label>]" >&2
  exit 1
fi
name="wtari-bridge-$network"

# Refuse placeholder or missing entries; run `pnpm sync-wtari-networks` first.
address=$(jq -r --arg n "$network" '.[$n].wTARIBridge.address // empty' networks.json)
start_block=$(jq -r --arg n "$network" '.[$n].wTARIBridge.startBlock // empty' networks.json)
if ! echo "$address" | grep -Eq '^0x[0-9a-fA-F]{40}$' || echo "$address" | grep -Eq '^0x0{40}$'; then
  echo "networks.json: $network has no valid non-zero wTARIBridge address (got '$address')" >&2
  exit 1
fi
if ! echo "$start_block" | grep -Eq '^[1-9][0-9]*$'; then
  echo "networks.json: $network wTARIBridge startBlock must be > 0 (got '$start_block')" >&2
  exit 1
fi

graph codegen subgraph.wtari.yaml

case "$target" in
  studio)
    if [ -n "$version" ]; then
      graph deploy "$name" subgraph.wtari.yaml --node https://api.studio.thegraph.com/deploy/ --network "$network" --version-label "$version"
    else
      graph deploy "$name" subgraph.wtari.yaml --node https://api.studio.thegraph.com/deploy/ --network "$network"
    fi
    ;;
  goldsky)
    if [ -z "$version" ]; then
      echo "goldsky needs --version <label>" >&2
      exit 1
    fi
    graph build subgraph.wtari.yaml --network "$network"
    goldsky subgraph deploy "$name/$version" --path build
    ;;
  *)
    echo "unknown target: $target (expected studio or goldsky)" >&2
    exit 1
    ;;
esac
