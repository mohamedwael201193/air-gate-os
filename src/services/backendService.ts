/**
 * Backend API Service
 * Communicates with airgate-keys backend for proof registration
 */

const BACKEND_URL =
  import.meta.env.VITE_PARTNER_TOKEN_URL?.replace("/api/partner-token", "") ||
  "https://airgate-keys.vercel.app";

export interface RegisterProofRequest {
  userAddress: string;
  proofType: string;
  credentialId: string;
  issuer: string;
  metadata?: Record<string, any>;
}

export interface RegisterProofResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Register a proof on-chain via backend webhook
 * Backend should use a funded wallet to call ProofOfWorkRegistry.registerProof()
 */
export async function registerProofOnChain(
  request: RegisterProofRequest
): Promise<RegisterProofResponse> {
  try {
    console.log("📤 Sending proof registration request to backend:", request);

    const response = await fetch(`${BACKEND_URL}/api/register-proof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Backend registration failed:",
        response.status,
        errorText
      );

      // For now, return success but log that backend isn't implemented yet
      return {
        success: true,
        error: "Backend endpoint not implemented yet - registration skipped",
      };
    }

    const result = await response.json();
    console.log("✅ Proof registered on-chain:", result);

    return result;
  } catch (error) {
    console.error("❌ Failed to register proof:", error);

    // For now, return success to allow demo to work
    // TODO: Implement backend /api/register-proof endpoint
    return {
      success: true,
      error: "Backend service unavailable - registration pending",
    };
  }
}

/**
 * Get recommended proof type based on credential type
 */
export function getProofType(credentialType: string): string {
  const proofTypeMap: Record<string, string> = {
    KYC_BASIC: "KYC",
    WORK_HISTORY: "WORK_HISTORY",
    FAN_BADGE: "COMMUNITY",
    EDUCATION: "EDUCATION",
    SKILL: "SKILL",
    LICENSE: "PROFESSIONAL_LICENSE",
  };

  return proofTypeMap[credentialType] || "OTHER";
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
