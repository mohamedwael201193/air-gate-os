/**
 * AirGate SDK - Lightweight helpers for integrating trust verification
 *
 * Usage:
 * ```typescript
 * import { getTrustScore, verifyAddress, getProofTypes } from '@/sdk/airgate';
 *
 * // Get trust score for an address
 * const score = await getTrustScore('0x...');
 *
 * // Verify if address has specific proof
 * const hasKYC = await verifyAddress('0x...', 'KYC');
 *
 * // Get all proof types for an address
 * const proofs = await getProofTypes('0x...');
 * ```
 */

import { ethers } from "ethers";

// Contract configuration
const CONTRACT_ADDRESS = "0x77F97D9a76F4c262c2235FD9b7F418A7c0C75D10";
const RPC_URL = "https://devnet-rpc.mocachain.org";

// Minimal ABI for read-only operations
const MINIMAL_ABI = [
  "function getTrustProfile(address userAddress) external view returns (uint256 trustScore, string[] memory proofTypes, uint256 endorsementCount, uint256 lastActivityTimestamp)",
  "function hasProof(address userAddress, string proofType) external view returns (bool)",
  "function getProofTypeWeight(string proofType) external view returns (uint256)",
];

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, provider);

/**
 * Get trust score for an address
 * @param address - Ethereum address to check
 * @returns Trust score (0 if no profile found)
 */
export async function getTrustScore(address: string): Promise<number> {
  try {
    const result = await contract.getTrustProfile(address);
    return Number(result[0]);
  } catch (error) {
    console.error("Failed to get trust score:", error);
    return 0;
  }
}

/**
 * Get complete trust profile for an address
 * @param address - Ethereum address to check
 * @returns Trust profile object or null if not found
 */
export async function getTrustProfile(address: string) {
  try {
    const result = await contract.getTrustProfile(address);
    return {
      trustScore: Number(result[0]),
      proofTypes: result[1] as string[],
      endorsementCount: Number(result[2]),
      lastActivityTimestamp: Number(result[3]),
    };
  } catch (error) {
    console.error("Failed to get trust profile:", error);
    return null;
  }
}

/**
 * Verify if address has a specific proof type
 * @param address - Ethereum address to check
 * @param proofType - Proof type to verify (e.g., 'KYC', 'WORK_HISTORY')
 * @returns true if proof exists, false otherwise
 */
export async function verifyAddress(
  address: string,
  proofType: string
): Promise<boolean> {
  try {
    return await contract.hasProof(address, proofType);
  } catch (error) {
    console.error("Failed to verify address:", error);
    return false;
  }
}

/**
 * Get all proof types for an address
 * @param address - Ethereum address to check
 * @returns Array of proof type strings
 */
export async function getProofTypes(address: string): Promise<string[]> {
  try {
    const result = await contract.getTrustProfile(address);
    return result[1] as string[];
  } catch (error) {
    console.error("Failed to get proof types:", error);
    return [];
  }
}

/**
 * Get weight value for a proof type
 * @param proofType - Proof type to check
 * @returns Weight value (0 if not found)
 */
export async function getProofTypeWeight(proofType: string): Promise<number> {
  try {
    const weight = await contract.getProofTypeWeight(proofType);
    return Number(weight);
  } catch (error) {
    console.error("Failed to get proof type weight:", error);
    return 0;
  }
}

/**
 * Get trust level label based on score
 * @param score - Trust score
 * @returns Human-readable trust level
 */
export function getTrustLevel(score: number): string {
  if (score >= 200) return "Exceptional";
  if (score >= 150) return "Excellent";
  if (score >= 100) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 30) return "Fair";
  return "Limited";
}

/**
 * Generate verification URL for an address
 * @param address - Ethereum address
 * @param baseUrl - Base URL of your app (default: current origin)
 * @returns Full verification URL
 */
export function getVerificationUrl(address: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/verify/${address}`;
}

// Export contract details for advanced usage
export const SDK_CONFIG = {
  contractAddress: CONTRACT_ADDRESS,
  rpcUrl: RPC_URL,
  chainId: 5151,
  explorerUrl: "https://devnet-scan.mocachain.org",
  network: "Moca Devnet",
};
