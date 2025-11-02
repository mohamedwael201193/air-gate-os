import { ethers } from "ethers";

// ProofOfWorkRegistry ABI (only the functions we need)
const REGISTRY_ABI = [
  "function registerProof(address userAddress, string proofType, string credentialId, string issuer) external",
  "function endorseProfile(address profileOwner) external",
  "function getTrustProfile(address userAddress) external view returns (uint256 trustScore, string[] memory proofTypes, uint256 endorsementCount, uint256 lastActivityTimestamp)",
  "function hasProof(address userAddress, string proofType) external view returns (bool)",
  "function getProofDetails(address userAddress, string proofType) external view returns (string credentialId, string issuer, uint256 timestamp)",
  "function getProofTypeWeight(string proofType) external view returns (uint256)",
  "event ProofRegistered(address indexed userAddress, string proofType, string credentialId, uint256 timestamp)",
  "event ProfileEndorsed(address indexed profileOwner, address indexed endorser, uint256 newEndorsementCount)",
] as const;

const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRY_CONTRACT_ADDRESS;
const RPC_URL =
  import.meta.env.VITE_MOCA_RPC_URL || "https://devnet-rpc.mocachain.org";

// Proof type mappings from credential types to contract proof types
export const PROOF_TYPE_MAP: Record<string, string> = {
  KYC_BASIC: "KYC",
  WORK_HISTORY: "WORK_HISTORY",
  FAN_BADGE: "COMMUNITY",
  EDUCATION: "EDUCATION",
  SKILL: "SKILL",
  LICENSE: "PROFESSIONAL_LICENSE",
};

export interface TrustProfile {
  trustScore: number;
  proofTypes: string[];
  endorsementCount: number;
  lastActivityTimestamp: number;
}

export interface ProofDetails {
  credentialId: string;
  issuer: string;
  timestamp: number;
}

/**
 * TrustService - Interact with on-chain ProofOfWorkRegistry
 */
class TrustService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      REGISTRY_ABI,
      this.provider
    );
  }

  /**
   * Get trust profile for an address
   * Returns null if profile doesn't exist (not an error)
   */
  async getTrustProfile(address: string): Promise<TrustProfile | null> {
    try {
      const result = await this.contract.getTrustProfile(address);
      return {
        trustScore: Number(result[0]),
        proofTypes: result[1],
        endorsementCount: Number(result[2]),
        lastActivityTimestamp: Number(result[3]),
      };
    } catch (error: any) {
      // If profile not found (contract reverts), return null instead of throwing
      if (
        error?.code === "CALL_EXCEPTION" ||
        error?.message?.includes("Profile not found") ||
        error?.message?.includes("execution reverted")
      ) {
        console.log("No on-chain trust profile found for address:", address);
        return null;
      }
      console.error("Failed to get trust profile:", error);
      throw error;
    }
  }

  /**
   * Check if address has specific proof type
   */
  async hasProof(address: string, proofType: string): Promise<boolean> {
    try {
      return await this.contract.hasProof(address, proofType);
    } catch (error) {
      console.error("Failed to check proof:", error);
      return false;
    }
  }

  /**
   * Get details of a specific proof
   */
  async getProofDetails(
    address: string,
    proofType: string
  ): Promise<ProofDetails | null> {
    try {
      const result = await this.contract.getProofDetails(address, proofType);
      if (!result.credentialId) return null;

      return {
        credentialId: result.credentialId,
        issuer: result.issuer,
        timestamp: Number(result.timestamp),
      };
    } catch (error) {
      console.error("Failed to get proof details:", error);
      return null;
    }
  }

  /**
   * Get weight of a proof type
   */
  async getProofTypeWeight(proofType: string): Promise<number> {
    try {
      const weight = await this.contract.getProofTypeWeight(proofType);
      return Number(weight);
    } catch (error) {
      console.error("Failed to get proof type weight:", error);
      return 0;
    }
  }

  /**
   * Register a proof on-chain (requires signer)
   */
  async registerProof(
    signer: ethers.Signer,
    userAddress: string,
    proofType: string,
    credentialId: string,
    issuer: string
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const contractWithSigner = this.contract.connect(signer) as any;
      const tx = await contractWithSigner.registerProof(
        userAddress,
        proofType,
        credentialId,
        issuer
      );
      return await tx.wait();
    } catch (error) {
      console.error("Failed to register proof:", error);
      throw error;
    }
  }

  /**
   * Endorse a profile (requires signer)
   */
  async endorseProfile(
    signer: ethers.Signer,
    profileOwner: string
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const contractWithSigner = this.contract.connect(signer) as any;
      const tx = await contractWithSigner.endorseProfile(profileOwner);
      return await tx.wait();
    } catch (error) {
      console.error("Failed to endorse profile:", error);
      throw error;
    }
  }

  /**
   * Listen for ProofRegistered events
   */
  onProofRegistered(
    callback: (
      userAddress: string,
      proofType: string,
      credentialId: string,
      timestamp: number
    ) => void
  ) {
    this.contract.on(
      "ProofRegistered",
      (userAddress, proofType, credentialId, timestamp) => {
        callback(userAddress, proofType, credentialId, Number(timestamp));
      }
    );
  }

  /**
   * Listen for ProfileEndorsed events
   */
  onProfileEndorsed(
    callback: (
      profileOwner: string,
      endorser: string,
      newEndorsementCount: number
    ) => void
  ) {
    this.contract.on(
      "ProfileEndorsed",
      (profileOwner, endorser, newEndorsementCount) => {
        callback(profileOwner, endorser, Number(newEndorsementCount));
      }
    );
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Export singleton instance
export const trustService = new TrustService();
