// Regenerates the wTARIBridge entries in networks.json from the contracts repo's deployments.json.
// Usage: pnpm sync-wtari-networks [path/to/deployments.json]
import { readFileSync, writeFileSync } from "node:fs";

const DEFAULT_DEPLOYMENTS =
  "../wxtm-bridge-contracts/wxtm-bridge-contracts-typechain/deployments/deployments.json";
const NETWORKS_FILE = "networks.json";

// Chain id -> graph network name (as used by `graph deploy --network`).
const NETWORK_NAMES: { [chainId: string]: string } = {
  "8453": "base",
  "84532": "base-sepolia",
};

const deploymentsPath = process.argv[2] ?? DEFAULT_DEPLOYMENTS;
const deployments = JSON.parse(readFileSync(deploymentsPath, "utf8"));
const networks = JSON.parse(readFileSync(NETWORKS_FILE, "utf8"));

// Same selection as getWtariChains(): every chain whose entry has wTARI.
for (const chainId of Object.keys(deployments)) {
  const dep = deployments[chainId];
  if (!dep.wTARI) {
    continue;
  }

  if (!/^[0-9]+$/.test(chainId) || !Object.hasOwn(NETWORK_NAMES, chainId)) {
    throw new Error(`No graph network name for chain ${chainId}; add it to NETWORK_NAMES`);
  }
  const network = NETWORK_NAMES[chainId];
  const address = dep.wTARIBridge;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    /^0x0{40}$/.test(address)
  ) {
    throw new Error(`Chain ${chainId} has wTARI but no valid non-zero wTARIBridge address (got ${address})`);
  }
  const startBlock = dep.wTARIBridgeStartBlock;
  if (!Number.isSafeInteger(startBlock) || startBlock <= 0) {
    throw new Error(`Chain ${chainId} has wTARI but wTARIBridgeStartBlock is not > 0 (got ${startBlock})`);
  }

  networks[network] = {
    ...networks[network],
    wTARIBridge: { address, startBlock },
  };
  console.log(`${network}: wTARIBridge ${address} from block ${startBlock}`);
}

writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2) + "\n");
