import { ethers } from "ethers";

// Simple DAO Governance Contract ABI
const GOVERNANCE_ABI = [
  "function createProposal(string memory title, string memory description, uint256 duration, uint256 minTrustScore) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, string title, string description, address proposer, uint256 votesFor, uint256 votesAgainst, uint256 endTime, uint256 minTrustScore, uint8 status))",
  "function getProposalCount() external view returns (uint256)",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
  "function getUserVotingPower(address user) external view returns (uint256)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower)",
];

const RPC_URL = import.meta.env.VITE_MOCA_RPC_URL;
const GOVERNANCE_CONTRACT_ADDRESS =
  import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const REGISTRY_CONTRACT_ADDRESS = import.meta.env
  .VITE_REGISTRY_CONTRACT_ADDRESS;

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  endTime: Date;
  minTrustScore: number;
  status: "active" | "passed" | "rejected" | "pending";
}

export interface VoteRecord {
  proposalId: number;
  voter: string;
  support: boolean;
  votingPower: number;
  timestamp: number;
}

class GovernanceService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract | null = null;
  private registryContract: ethers.Contract | null = null;
  private useRealContract: boolean = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);

    // Check if governance contract is deployed
    this.useRealContract =
      GOVERNANCE_CONTRACT_ADDRESS !==
      "0x0000000000000000000000000000000000000000";

    if (this.useRealContract) {
      this.contract = new ethers.Contract(
        GOVERNANCE_CONTRACT_ADDRESS,
        GOVERNANCE_ABI,
        this.provider
      );
    }

    // Registry contract ABI (minimal for trust score)
    const REGISTRY_ABI = [
      "function profiles(address) external view returns (uint256 trustScore, uint256 proofCount, uint256 lastActivityTimestamp)",
      "function getUserProofIds(address) external view returns (bytes32[])",
    ];

    if (REGISTRY_CONTRACT_ADDRESS) {
      this.registryContract = new ethers.Contract(
        REGISTRY_CONTRACT_ADDRESS,
        REGISTRY_ABI,
        this.provider
      );
    }
  }

  /**
   * Get all active proposals from blockchain or fallback to local data
   */
  async getProposals(): Promise<Proposal[]> {
    try {
      if (this.useRealContract && this.contract) {
        // Fetch from real blockchain contract
        const count = await this.contract.getProposalCount();
        const proposals: Proposal[] = [];

        for (let i = 1; i <= Number(count); i++) {
          const proposal = await this.contract.getProposal(i);
          proposals.push({
            id: Number(proposal.id),
            title: proposal.title,
            description: proposal.description,
            proposer: proposal.proposer,
            votesFor: Number(proposal.votesFor),
            votesAgainst: Number(proposal.votesAgainst),
            endTime: new Date(Number(proposal.endTime) * 1000),
            minTrustScore: Number(proposal.minTrustScore),
            status: this.getProposalStatus(proposal.status),
          });
        }

        return proposals;
      } else {
        // Fallback: Use localStorage for simulated proposals
        return this.getLocalProposals();
      }
    } catch (error) {
      console.error("Failed to fetch proposals from blockchain:", error);
      return this.getLocalProposals();
    }
  }

  /**
   * Get local/simulated proposals (fallback)
   */
  private getLocalProposals(): Proposal[] {
    const stored = localStorage.getItem("dao_proposals");
    if (stored) {
      const proposals = JSON.parse(stored);
      return proposals.map((p: any) => ({
        ...p,
        endTime: new Date(p.endTime),
      }));
    }

    // Default proposals with real-looking data
    const defaultProposals: Proposal[] = [
      {
        id: 1,
        title: "Increase Trust Score for Work History",
        description:
          "Proposal to increase the trust score bonus for verified work history credentials from 25 to 35 points to better incentivize professional verification.",
        proposer: "0x742d35A8471BA17A5a2B3D4D09876C914CE5B4a2c",
        votesFor: 0,
        votesAgainst: 0,
        endTime: new Date(Date.now() + 86400000 * 2),
        minTrustScore: 0,
        status: "active",
      },
      {
        id: 2,
        title: "Add GitHub Verification as Credential Type",
        description:
          "Introduce GitHub account verification as a new credential type worth 20 trust score points. This would enable developer community participation.",
        proposer: "0x8b3fD3c1A9BD45e8C2E7F9A1b5c3d4e5f6a7b8c9d1e",
        votesFor: 0,
        votesAgainst: 0,
        endTime: new Date(Date.now() + 86400000 * 5),
        minTrustScore: 0,
        status: "active",
      },
      {
        id: 3,
        title: "Implement Collateral Rate Governance",
        description:
          "Allow DAO to vote on adjusting DeFi collateral rates based on market conditions. This proposal grants governance control over the risk parameters.",
        proposer: "0x1a7c8B9f4D3e2A1c5b6d7e8f9a0b1c2d3e4f5a6f8b",
        votesFor: 0,
        votesAgainst: 0,
        endTime: new Date(Date.now() + 86400000 * 7),
        minTrustScore: 50,
        status: "active",
      },
    ];

    localStorage.setItem("dao_proposals", JSON.stringify(defaultProposals));
    return defaultProposals;
  }

  /**
   * Get voting power for a user from blockchain
   */
  async getVotingPower(userAddress: string): Promise<number> {
    try {
      if (this.registryContract) {
        // Get trust score from registry contract
        const profile = await this.registryContract.profiles(userAddress);
        const trustScore = Number(profile.trustScore);
        // Voting power = trust score (capped at 100)
        return Math.min(100, Math.max(1, trustScore));
      }
    } catch (error) {
      console.warn("Failed to fetch voting power from blockchain:", error);
    }
    return 1; // Minimum voting power
  }

  /**
   * Check if user has voted on a proposal
   */
  async hasUserVoted(
    proposalId: number,
    userAddress: string
  ): Promise<boolean> {
    try {
      if (this.useRealContract && this.contract) {
        return await this.contract.hasVoted(proposalId, userAddress);
      } else {
        // Check localStorage
        const history = localStorage.getItem("dao_voting_history");
        if (history) {
          const votes = JSON.parse(history);
          return votes[`${userAddress}_${proposalId}`] === true;
        }
      }
    } catch (error) {
      console.error("Failed to check voting status:", error);
    }
    return false;
  }

  /**
   * Cast a vote on a proposal
   */
  async vote(
    proposalId: number,
    support: boolean,
    userAddress: string,
    votingPower: number
  ): Promise<void> {
    try {
      if (this.useRealContract && this.contract) {
        // Cast vote on-chain (requires wallet connection)
        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as any;
        const tx = await contractWithSigner.vote(proposalId, support);
        await tx.wait();
        console.log("✅ Vote recorded on-chain:", tx.hash);
      } else {
        // Store vote locally and update proposal
        await this.recordLocalVote(
          proposalId,
          support,
          userAddress,
          votingPower
        );
      }
    } catch (error) {
      console.error("Failed to cast vote:", error);
      throw error;
    }
  }

  /**
   * Record vote locally (fallback)
   */
  private async recordLocalVote(
    proposalId: number,
    support: boolean,
    userAddress: string,
    votingPower: number
  ): Promise<void> {
    // Mark user as voted
    const history = JSON.parse(
      localStorage.getItem("dao_voting_history") || "{}"
    );
    history[`${userAddress}_${proposalId}`] = true;
    localStorage.setItem("dao_voting_history", JSON.stringify(history));

    // Update proposal vote counts
    const proposals = this.getLocalProposals();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal) {
      if (support) {
        proposal.votesFor += votingPower;
      } else {
        proposal.votesAgainst += votingPower;
      }
      localStorage.setItem("dao_proposals", JSON.stringify(proposals));
    }

    // Store vote record
    const voteRecord: VoteRecord = {
      proposalId,
      voter: userAddress,
      support,
      votingPower,
      timestamp: Date.now(),
    };
    const voteRecords = JSON.parse(
      localStorage.getItem("dao_vote_records") || "[]"
    );
    voteRecords.push(voteRecord);
    localStorage.setItem("dao_vote_records", JSON.stringify(voteRecords));

    console.log("✅ Vote recorded locally:", voteRecord);
  }

  /**
   * Get vote records for a proposal
   */
  async getProposalVotes(proposalId: number): Promise<VoteRecord[]> {
    try {
      // For now, return local records
      // In future, fetch from blockchain events
      const records = JSON.parse(
        localStorage.getItem("dao_vote_records") || "[]"
      );
      return records.filter((r: VoteRecord) => r.proposalId === proposalId);
    } catch (error) {
      console.error("Failed to fetch vote records:", error);
      return [];
    }
  }

  /**
   * Create a new proposal (requires governance power)
   */
  async createProposal(
    title: string,
    description: string,
    durationDays: number,
    minTrustScore: number,
    userAddress: string
  ): Promise<number> {
    try {
      if (this.useRealContract && this.contract) {
        const signer = await this.provider.getSigner();
        const contractWithSigner = this.contract.connect(signer) as any;
        const duration = durationDays * 24 * 60 * 60; // Convert to seconds
        const tx = await contractWithSigner.createProposal(
          title,
          description,
          duration,
          minTrustScore
        );
        const receipt = await tx.wait();

        // Extract proposal ID from event
        const event = receipt.logs.find(
          (log: any) => log.eventName === "ProposalCreated"
        );
        return Number(event?.args?.proposalId || 0);
      } else {
        // Create locally
        const proposals = this.getLocalProposals();
        const newId = Math.max(...proposals.map((p) => p.id), 0) + 1;
        const newProposal: Proposal = {
          id: newId,
          title,
          description,
          proposer: userAddress,
          votesFor: 0,
          votesAgainst: 0,
          endTime: new Date(Date.now() + durationDays * 86400000),
          minTrustScore,
          status: "active",
        };
        proposals.push(newProposal);
        localStorage.setItem("dao_proposals", JSON.stringify(proposals));
        return newId;
      }
    } catch (error) {
      console.error("Failed to create proposal:", error);
      throw error;
    }
  }

  private getProposalStatus(
    status: number
  ): "active" | "passed" | "rejected" | "pending" {
    switch (status) {
      case 0:
        return "pending";
      case 1:
        return "active";
      case 2:
        return "passed";
      case 3:
        return "rejected";
      default:
        return "active";
    }
  }

  /**
   * Check if governance contract is deployed
   */
  isContractDeployed(): boolean {
    return this.useRealContract;
  }

  /**
   * Get total unique voters across all proposals
   */
  async getTotalVoters(): Promise<number> {
    try {
      const records = JSON.parse(
        localStorage.getItem("dao_vote_records") || "[]"
      );
      const uniqueVoters = new Set(records.map((r: VoteRecord) => r.voter));
      return uniqueVoters.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total voting power cast across all proposals
   */
  async getTotalVotingPower(): Promise<number> {
    try {
      const records = JSON.parse(
        localStorage.getItem("dao_vote_records") || "[]"
      );
      return records.reduce(
        (sum: number, r: VoteRecord) => sum + r.votingPower,
        0
      );
    } catch (error) {
      return 0;
    }
  }
}

export const governanceService = new GovernanceService();
