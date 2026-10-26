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

  const network = NETWORK_NAMES[chainId];
  if (!network) {
    throw new Error(`No graph network name for chain ${chainId}; add it to NETWORK_NAMES`);
  }
  if (typeof dep.wTARIBridge !== "string") {
    throw new Error(`Chain ${chainId} has wTARI but no wTARIBridge address`);
  }
  if (typeof dep.wTARIBridgeStartBlock !== "number") {
    throw new Error(`Chain ${chainId} has wTARI but no wTARIBridgeStartBlock`);
  }

  networks[network] = {
    ...networks[network],
    wTARIBridge: { address: dep.wTARIBridge, startBlock: dep.wTARIBridgeStartBlock },
  };
  console.log(`${network}: wTARIBridge ${dep.wTARIBridge} from block ${dep.wTARIBridgeStartBlock}`);
}

writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2) + "\n");
