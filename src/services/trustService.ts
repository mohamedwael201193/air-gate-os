import { ethers } from "ethers";

// ProofOfWorkRegistry ABI - matches the deployed contract
const REGISTRY_ABI = [
  "function registerProof(address userAddress, string credentialType, string credentialId, string metadata) external returns (uint256)",
  "function profiles(address) external view returns (uint256 proofCount, uint256 firstProofTimestamp, bool hasKYC, uint256 workHistoryCount, bool hasFanBadge, uint256 trustScore, uint256 lastUpdated)",
  "function getUserProofIds(address userAddress) external view returns (uint256[] memory)",
  "function getProof(address userAddress, uint256 proofId) external view returns (string memory credentialType, string memory credentialId, string memory metadata, uint256 timestamp, bool isActive)",
  "function hasCredentialType(address userAddress, string credentialType) external view returns (bool)",
  "event ProofRegistered(address indexed user, uint256 indexed proofId, string credentialType, string credentialId, uint256 timestamp)",
  "event TrustScoreUpdated(address indexed user, uint256 newScore, uint256 timestamp)",
] as const;

const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRY_CONTRACT_ADDRESS;
const RPC_URL =
  import.meta.env.VITE_MOCA_RPC_URL || "https://devnet-rpc.mocachain.org";

export interface TrustProfile {
  trustScore: number;
  proofCount: number;
  proofTypes: string[];
  endorsementCount: number;
  lastActivityTimestamp: number;
  hasKYC: boolean;
  workHistoryCount: number;
  hasFanBadge: boolean;
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
   * Returns null if profile doesn't exist (proofCount = 0)
   */
  async getTrustProfile(address: string): Promise<TrustProfile | null> {
    try {
      const result = await this.contract.profiles(address);

      const proofCount = Number(result[0]);

      // If no proofs registered, return null
      if (proofCount === 0) {
        console.log("No on-chain trust profile found for address:", address);
        return null;
      }

      // Get proof types by checking getUserProofIds and getProof
      const proofIds = await this.contract.getUserProofIds(address);
      const proofTypes: string[] = [];

      for (const proofId of proofIds) {
        try {
          const proof = await this.contract.getProof(address, proofId);
          const credentialType = proof[0];
          const isActive = proof[4];

          if (isActive && !proofTypes.includes(credentialType)) {
            proofTypes.push(credentialType);
          }
        } catch (err) {
          console.warn(`Failed to get proof ${proofId}:`, err);
        }
      }

      return {
        proofCount,
        trustScore: Number(result[5]),
        proofTypes,
        endorsementCount: 0, // Contract doesn't have endorsements yet
        lastActivityTimestamp: Number(result[6]),
        hasKYC: result[2],
        workHistoryCount: Number(result[3]),
        hasFanBadge: result[4],
      };
    } catch (error: any) {
      console.error("Failed to get trust profile:", error);
      return null;
    }
  }

  /**
   * Check if address has specific credential type
   */
  async hasProof(address: string, credentialType: string): Promise<boolean> {
    try {
      return await this.contract.hasCredentialType(address, credentialType);
    } catch (error) {
      console.error("Failed to check proof:", error);
      return false;
    }
  }

  /**
   * Get all proof IDs for an address
   */
  async getUserProofIds(address: string): Promise<number[]> {
    try {
      const ids = await this.contract.getUserProofIds(address);
      return ids.map((id: bigint) => Number(id));
    } catch (error) {
      console.error("Failed to get user proof IDs:", error);
      return [];
    }
  }

  /**
   * Get specific proof details
   */
  async getProof(
    address: string,
    proofId: number
  ): Promise<{
    credentialType: string;
    credentialId: string;
    metadata: string;
    timestamp: number;
    isActive: boolean;
  } | null> {
    try {
      const result = await this.contract.getProof(address, proofId);
      return {
        credentialType: result[0],
        credentialId: result[1],
        metadata: result[2],
        timestamp: Number(result[3]),
        isActive: result[4],
      };
    } catch (error) {
      console.error("Failed to get proof:", error);
      return null;
    }
  }

  /**
   * Get blockchain statistics by analyzing ProofRegistered events
   * Returns aggregate data about the entire system
   */
  async getBlockchainStatistics(): Promise<{
    totalProofs: number;
    uniqueUsers: Set<string>;
    credentialTypes: Map<string, number>;
    totalUsers: number;
  }> {
    try {
      // Query all ProofRegistered events from the contract
      const filter = this.contract.filters.ProofRegistered();
      const events = await this.contract.queryFilter(filter, 0, "latest");

      const uniqueUsers = new Set<string>();
      const credentialTypes = new Map<string, number>();

      events.forEach((event: any) => {
        const userAddress = event.args?.user;
        const credentialType = event.args?.credentialType;

        if (userAddress) {
          uniqueUsers.add(userAddress.toLowerCase());
        }

        if (credentialType) {
          credentialTypes.set(
            credentialType,
            (credentialTypes.get(credentialType) || 0) + 1
          );
        }
      });

      return {
        totalProofs: events.length,
        uniqueUsers,
        credentialTypes,
        totalUsers: uniqueUsers.size,
      };
    } catch (error) {
      console.error("Failed to fetch blockchain statistics:", error);
      return {
        totalProofs: 0,
        uniqueUsers: new Set(),
        credentialTypes: new Map(),
        totalUsers: 0,
      };
    }
  }

  /**
   * Listen for ProofRegistered events
   */
  onProofRegistered(
    callback: (
      user: string,
      proofId: number,
      credentialType: string,
      credentialId: string,
      timestamp: number
    ) => void
  ) {
    this.contract.on(
      "ProofRegistered",
      (user, proofId, credentialType, credentialId, timestamp) => {
        callback(
          user,
          Number(proofId),
          credentialType,
          credentialId,
          Number(timestamp)
        );
      }
    );
  }

  /**
   * Listen for TrustScoreUpdated events
   */
  onTrustScoreUpdated(
    callback: (user: string, newScore: number, timestamp: number) => void
  ) {
    this.contract.on("TrustScoreUpdated", (user, newScore, timestamp) => {
      callback(user, Number(newScore), Number(timestamp));
    });
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
