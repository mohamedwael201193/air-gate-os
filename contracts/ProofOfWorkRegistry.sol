// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofOfWorkRegistry
 * @notice On-chain registry for verified credentials and trust scores on Moca Network
 * @dev Designed for AirGate OS - Identity Operating System
 * 
 * Trust Score Calculation (0-200 points):
 * - KYC Verification: 50 points
 * - Work History: 30 points per verified position (max 90)
 * - Fan Badge: 20 points
 * - Time-based bonus: 1 point per month since first proof (max 30)
 * - Activity bonus: 10 points per additional proof type beyond 3
 */
contract ProofOfWorkRegistry {
    
    struct Proof {
        address userAddress;
        string credentialType; // "KYC_BASIC", "WORK_HISTORY", "FAN_BADGE"
        string credentialId;   // AIR credential ID
        string metadata;       // JSON metadata
        uint256 timestamp;
        bool isActive;
    }

    struct UserProfile {
        uint256 proofCount;
        uint256 firstProofTimestamp;
        bool hasKYC;
        uint256 workHistoryCount;
        bool hasFanBadge;
        uint256 trustScore;
        uint256 lastUpdated;
    }

    // Storage
    mapping(address => UserProfile) public profiles;
    mapping(address => mapping(uint256 => Proof)) public userProofs;
    mapping(address => uint256[]) private userProofIds;
    mapping(bytes32 => bool) private credentialHashes; // Prevent duplicate registration
    
    uint256 public totalProofs;
    uint256 public totalUsers;

    // Events
    event ProofRegistered(
        address indexed user,
        uint256 indexed proofId,
        string credentialType,
        string credentialId,
        uint256 timestamp
    );

    event TrustScoreUpdated(
        address indexed user,
        uint256 newScore,
        uint256 timestamp
    );

    event ProofRevoked(
        address indexed user,
        uint256 indexed proofId,
        uint256 timestamp
    );

    /**
     * @notice Register a new proof of work for a user
     * @param userAddress The address of the user
     * @param credentialType Type of credential (KYC_BASIC, WORK_HISTORY, FAN_BADGE)
     * @param credentialId AIR credential ID
     * @param metadata JSON metadata about the credential
     */
    function registerProof(
        address userAddress,
        string memory credentialType,
        string memory credentialId,
        string memory metadata
    ) external returns (uint256) {
        require(userAddress != address(0), "Invalid user address");
        require(bytes(credentialType).length > 0, "Credential type required");
        require(bytes(credentialId).length > 0, "Credential ID required");

        // Prevent duplicate registration
        bytes32 credentialHash = keccak256(abi.encodePacked(userAddress, credentialId));
        require(!credentialHashes[credentialHash], "Credential already registered");
        credentialHashes[credentialHash] = true;

        // Initialize profile if first proof
        UserProfile storage profile = profiles[userAddress];
        if (profile.proofCount == 0) {
            profile.firstProofTimestamp = block.timestamp;
            totalUsers++;
        }

        // Create proof record
        uint256 proofId = totalProofs;
        userProofs[userAddress][proofId] = Proof({
            userAddress: userAddress,
            credentialType: credentialType,
            credentialId: credentialId,
            metadata: metadata,
            timestamp: block.timestamp,
            isActive: true
        });

        userProofIds[userAddress].push(proofId);
        profile.proofCount++;
        totalProofs++;

        // Update profile statistics
        if (keccak256(bytes(credentialType)) == keccak256(bytes("KYC_BASIC"))) {
            profile.hasKYC = true;
        } else if (keccak256(bytes(credentialType)) == keccak256(bytes("WORK_HISTORY"))) {
            profile.workHistoryCount++;
        } else if (keccak256(bytes(credentialType)) == keccak256(bytes("FAN_BADGE"))) {
            profile.hasFanBadge = true;
        }

        // Recalculate trust score
        profile.trustScore = _calculateTrustScore(userAddress);
        profile.lastUpdated = block.timestamp;

        emit ProofRegistered(userAddress, proofId, credentialType, credentialId, block.timestamp);
        emit TrustScoreUpdated(userAddress, profile.trustScore, block.timestamp);

        return proofId;
    }

    /**
     * @notice Calculate trust score for a user (0-200 points)
     * @param userAddress The address to calculate score for
     * @return Trust score between 0 and 200
     */
    function _calculateTrustScore(address userAddress) private view returns (uint256) {
        UserProfile memory profile = profiles[userAddress];
        uint256 score = 0;

        // KYC Verification: 50 points
        if (profile.hasKYC) {
            score += 50;
        }

        // Work History: 30 points per position (max 90)
        if (profile.workHistoryCount > 0) {
            uint256 workScore = profile.workHistoryCount * 30;
            score += workScore > 90 ? 90 : workScore;
        }

        // Fan Badge: 20 points
        if (profile.hasFanBadge) {
            score += 20;
        }

        // Time-based bonus: 1 point per month since first proof (max 30)
        if (profile.firstProofTimestamp > 0) {
            uint256 monthsSinceFirst = (block.timestamp - profile.firstProofTimestamp) / 30 days;
            uint256 timeBonus = monthsSinceFirst > 30 ? 30 : monthsSinceFirst;
            score += timeBonus;
        }

        // Activity bonus: 10 points per additional proof type beyond 3
        if (profile.proofCount > 3) {
            uint256 activityBonus = (profile.proofCount - 3) * 10;
            score += activityBonus;
        }

        return score > 200 ? 200 : score;
    }

    /**
     * @notice Get trust score for a user (public verification)
     * @param userAddress The address to check
     * @return Trust score (0-200)
     */
    function getTrustScore(address userAddress) external view returns (uint256) {
        return profiles[userAddress].trustScore;
    }

    /**
     * @notice Get complete profile for a user
     * @param userAddress The address to check
     */
    function getUserProfile(address userAddress) external view returns (
        uint256 proofCount,
        uint256 firstProofTimestamp,
        bool hasKYC,
        uint256 workHistoryCount,
        bool hasFanBadge,
        uint256 trustScore,
        uint256 lastUpdated
    ) {
        UserProfile memory profile = profiles[userAddress];
        return (
            profile.proofCount,
            profile.firstProofTimestamp,
            profile.hasKYC,
            profile.workHistoryCount,
            profile.hasFanBadge,
            profile.trustScore,
            profile.lastUpdated
        );
    }

    /**
     * @notice Get all proof IDs for a user
     * @param userAddress The address to check
     * @return Array of proof IDs
     */
    function getUserProofIds(address userAddress) external view returns (uint256[] memory) {
        return userProofIds[userAddress];
    }

    /**
     * @notice Get specific proof details
     * @param userAddress The user's address
     * @param proofId The proof ID
     */
    function getProof(address userAddress, uint256 proofId) external view returns (
        string memory credentialType,
        string memory credentialId,
        string memory metadata,
        uint256 timestamp,
        bool isActive
    ) {
        Proof memory proof = userProofs[userAddress][proofId];
        return (
            proof.credentialType,
            proof.credentialId,
            proof.metadata,
            proof.timestamp,
            proof.isActive
        );
    }

    /**
     * @notice Verify if address has specific credential type
     * @param userAddress The address to check
     * @param credentialType The type to verify
     * @return True if user has this credential type
     */
    function hasCredentialType(address userAddress, string memory credentialType) external view returns (bool) {
        bytes32 typeHash = keccak256(bytes(credentialType));
        
        if (typeHash == keccak256(bytes("KYC_BASIC"))) {
            return profiles[userAddress].hasKYC;
        } else if (typeHash == keccak256(bytes("FAN_BADGE"))) {
            return profiles[userAddress].hasFanBadge;
        } else if (typeHash == keccak256(bytes("WORK_HISTORY"))) {
            return profiles[userAddress].workHistoryCount > 0;
        }
        
        return false;
    }

    /**
     * @notice Revoke a proof (for compliance/errors)
     * @param userAddress The user's address
     * @param proofId The proof to revoke
     */
    function revokeProof(address userAddress, uint256 proofId) external {
        Proof storage proof = userProofs[userAddress][proofId];
        require(proof.isActive, "Proof already revoked");
        require(proof.userAddress == userAddress, "Invalid proof");

        proof.isActive = false;
        
        UserProfile storage profile = profiles[userAddress];
        profile.proofCount--;
        
        // Update credential type flags
        if (keccak256(bytes(proof.credentialType)) == keccak256(bytes("KYC_BASIC"))) {
            profile.hasKYC = false;
        } else if (keccak256(bytes(proof.credentialType)) == keccak256(bytes("WORK_HISTORY"))) {
            if (profile.workHistoryCount > 0) profile.workHistoryCount--;
        } else if (keccak256(bytes(proof.credentialType)) == keccak256(bytes("FAN_BADGE"))) {
            profile.hasFanBadge = false;
        }

        // Recalculate trust score
        profile.trustScore = _calculateTrustScore(userAddress);
        profile.lastUpdated = block.timestamp;

        emit ProofRevoked(userAddress, proofId, block.timestamp);
        emit TrustScoreUpdated(userAddress, profile.trustScore, block.timestamp);
    }

    /**
     * @notice Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalProofsCount,
        uint256 totalUsersCount
    ) {
        return (totalProofs, totalUsers);
    }
}
