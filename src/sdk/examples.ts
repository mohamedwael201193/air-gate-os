/**
 * AirGate SDK Usage Examples
 *
 * This file demonstrates how to integrate AirGate's trust verification
 * into your own applications.
 */

import {
  getProofTypes,
  getTrustLevel,
  getTrustProfile,
  getTrustScore,
  getVerificationUrl,
  SDK_CONFIG,
  verifyAddress,
} from "./airgate";

// Example 1: Check if candidate meets minimum trust requirement
export async function checkCandidateEligibility(
  address: string
): Promise<boolean> {
  const score = await getTrustScore(address);
  const MINIMUM_SCORE = 50; // Define your threshold

  if (score >= MINIMUM_SCORE) {
    console.log(`✅ Candidate eligible with trust score: ${score}`);
    return true;
  } else {
    console.log(`❌ Candidate below minimum trust score: ${score}`);
    return false;
  }
}

// Example 2: Verify specific credential requirement
export async function verifyEmploymentCredential(
  address: string
): Promise<boolean> {
  const hasKYC = await verifyAddress(address, "KYC");
  const hasWorkHistory = await verifyAddress(address, "WORK_HISTORY");

  if (hasKYC && hasWorkHistory) {
    console.log("✅ Candidate has both KYC and Work History proofs");
    return true;
  } else {
    console.log("❌ Missing required proofs:", {
      kyc: hasKYC,
      workHistory: hasWorkHistory,
    });
    return false;
  }
}

// Example 3: Get complete candidate profile
export async function getCandidateProfile(address: string) {
  const profile = await getTrustProfile(address);

  if (!profile) {
    return {
      status: "not_found",
      message: "No trust profile found for this address",
    };
  }

  return {
    status: "verified",
    trustScore: profile.trustScore,
    trustLevel: getTrustLevel(profile.trustScore),
    credentials: profile.proofTypes,
    endorsements: profile.endorsementCount,
    lastActivity: new Date(profile.lastActivityTimestamp * 1000).toISOString(),
    verificationUrl: getVerificationUrl(address),
  };
}

// Example 4: Batch verify multiple candidates
export async function batchVerifyCandidates(
  addresses: string[]
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};

  for (const address of addresses) {
    results[address] = await getTrustScore(address);
  }

  // Sort by trust score (descending)
  const sorted = Object.entries(results).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  );

  console.log("🏆 Top candidates:", sorted.slice(0, 3));

  return results;
}

// Example 5: Generate shareable verification badge
export function generateVerificationBadge(
  address: string,
  trustScore: number
): string {
  const level = getTrustLevel(trustScore);
  const url = getVerificationUrl(address);

  return `
    <div class="airgate-badge">
      <a href="${url}" target="_blank">
        <span class="badge-icon">🛡️</span>
        <span class="badge-label">${level}</span>
        <span class="badge-score">${trustScore} Trust Score</span>
      </a>
    </div>
  `;
}

// Example 6: Real-world job application filter
export async function filterQualifiedApplicants(
  applicants: { address: string; name: string }[]
) {
  const MINIMUM_SCORE = 50;
  const REQUIRED_PROOFS = ["KYC", "WORK_HISTORY"];

  const qualified = [];

  for (const applicant of applicants) {
    const score = await getTrustScore(applicant.address);
    const proofs = await getProofTypes(applicant.address);

    const hasRequiredProofs = REQUIRED_PROOFS.every((proof) =>
      proofs.includes(proof)
    );
    const meetsScoreThreshold = score >= MINIMUM_SCORE;

    if (hasRequiredProofs && meetsScoreThreshold) {
      qualified.push({
        ...applicant,
        trustScore: score,
        trustLevel: getTrustLevel(score),
        proofs,
      });
    }
  }

  return qualified.sort((a, b) => b.trustScore - a.trustScore);
}

// Example 7: Display SDK configuration
export function displaySDKInfo() {
  console.log("📚 AirGate SDK Configuration:");
  console.log(`  Contract: ${SDK_CONFIG.contractAddress}`);
  console.log(`  Network: ${SDK_CONFIG.network}`);
  console.log(`  Chain ID: ${SDK_CONFIG.chainId}`);
  console.log(`  RPC: ${SDK_CONFIG.rpcUrl}`);
  console.log(`  Explorer: ${SDK_CONFIG.explorerUrl}`);
}

// Example 8: React hook for trust verification
export function useAirGateTrust(address: string | null) {
  // This is a pseudo-code example - adapt for your React setup
  /*
  const [trustProfile, setTrustProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!address) return;
    
    getTrustProfile(address)
      .then(setTrustProfile)
      .finally(() => setLoading(false));
  }, [address]);
  
  return { trustProfile, loading };
  */
}
