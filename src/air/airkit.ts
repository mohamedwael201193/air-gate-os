import { AirService, BUILD_ENV } from "@mocanetwork/airkit";

// Core AIR service management
let svc: AirService | null = null;
let initialized = false;

/**
 * Generates a stable credentialSubject.id URI for the current user.
 * Required by all credential schemas. Uses stored user ID when available,
 * otherwise generates a new UUID. Returns a proper DID Web URI format.
 */
export function getSubjectId() {
  try {
    const u = JSON.parse(localStorage.getItem("airUser") || "{}");
    const uid = u?.id || crypto.randomUUID();
    return `did:web:${location.host}:user:${uid}`; // valid URI, stable per user
  } catch {
    return `did:web:${location.host}:user:${crypto.randomUUID()}`;
  }
}

export async function getAirService() {
  if (!svc) {
    svc = new AirService({ partnerId: import.meta.env.VITE_AIR_PARTNER_ID });
  }
  if (!initialized) {
    await svc.init({
      buildEnv: BUILD_ENV.SANDBOX, // testnet/sandbox per docs
      enableLogging: true, // Always enable logging to debug issues
      skipRehydration: false,
      // do NOT pass environmentConfig/widgetUrl/apiUrl here
    });
    initialized = true;
  }
  return svc;
}

async function getPartnerToken(scope: "login" | "issue" | "verify" = "verify") {
  try {
    const url = `${import.meta.env.VITE_PARTNER_TOKEN_URL}?scope=${scope}`;
    console.log("🔵 Fetching partner token for scope:", scope);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!r.ok) throw new Error(`partner-token ${scope} failed: ${r.status}`);
    const token = await r.text();
    console.log("✅ Partner token obtained for scope:", scope);
    return token;
  } catch (error) {
    console.error(`❌ Failed to get partner token for scope ${scope}:`, error);
    // For development, return a placeholder token
    if (import.meta.env.MODE === "development") {
      console.warn("🟡 Using placeholder token for development");
      return `dev-token-${scope}-${Date.now()}`;
    }
    throw error;
  }
}

export async function airLogin() {
  const s = await getAirService();
  try {
    // Optionally supply BYO auth token: const jwt = await getPartnerToken("login");
    // return s.login({ authToken: jwt });
    console.log("🔵 Starting AIR login...");
    const result = await s.login();
    console.log("✅ AIR login successful:", result);
    console.log("📝 Login result type:", typeof result);
    console.log("📝 Login result keys:", Object.keys(result || {}));

    // Force showing the full object structure
    console.group("� FULL USER OBJECT DETAILS:");
    console.log("Raw object:", result);
    console.log("JSON string:", JSON.stringify(result, null, 2));
    if (result) {
      Object.keys(result).forEach((key) => {
        console.log(`  ${key}:`, (result as any)[key]);
      });
    }
    console.groupEnd();

    console.log(
      "📝 User DID:",
      (result as any)?.id ||
        (result as any)?.did ||
        (result as any)?.userDid ||
        "NOT FOUND"
    );

    // Extract user info and store in localStorage for getSubjectId
    const emailAccount = (result as any)?.linkedAccounts?.find(
      (acc: any) => acc.type === "email"
    );

    const walletAccount = (result as any)?.linkedAccounts?.find(
      (acc: any) => acc.type === "wallet"
    );

    const userInfo = {
      id:
        (result as any)?.id || (result as any)?.did || (result as any)?.userDid,
      email: (result as any)?.email || emailAccount?.address,
      name:
        (result as any)?.name ||
        (result as any)?.given_name ||
        (result as any)?.family_name,
      wallet: walletAccount || (result as any)?.wallet,
      abstractAccountAddress: (result as any)?.abstractAccountAddress,
      linkedAccounts: (result as any)?.linkedAccounts || [],
      ...result,
    };

    console.log("📧 User Email:", userInfo.email || "NOT FOUND");
    console.log("👤 User Name:", userInfo.name || "NOT FOUND");
    console.log("🔗 Linked Accounts:", userInfo.linkedAccounts?.length || 0);
    localStorage.setItem("airUser", JSON.stringify(userInfo));

    return userInfo;
  } catch (error) {
    console.error("❌ AIR login failed:", error);
    throw error;
  }
}

/**
 * Decode JWT token to extract claims (without verification)
 * Used to extract OIDC standard claims: email, name, etc.
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Get user profile data from stored AIR login information
 * Returns: { name, email, did, account, linkedAccounts }
 */
export function getUserProfile() {
  try {
    const stored = localStorage.getItem("airUser");
    if (!stored) return null;

    const userData = JSON.parse(stored);
    console.log("📋 getUserProfile - Raw userData:", userData);

    const emailAccount = userData.linkedAccounts?.find(
      (acc: any) => acc.type === "email"
    );
    const walletAccount = userData.linkedAccounts?.find(
      (acc: any) => acc.type === "wallet"
    );
    const customAuth = userData.linkedAccounts?.find(
      (acc: any) => acc.type === "custom_auth"
    );

    // Extract email from multiple possible sources
    const email =
      userData.email ||
      userData.user?.email ||
      emailAccount?.address ||
      userData.linkedAccounts?.find((acc: any) => acc.email)?.email;

    // Extract name from multiple possible sources
    let displayName =
      userData.name ||
      userData.user?.name ||
      userData.given_name ||
      userData.user?.given_name;

    // If no name but we have email, derive from email
    if (!displayName && email) {
      const localPart = email.split("@")[0];
      // Convert "satoshi.n" or "satoshi_n" to "Satoshi N"
      displayName = localPart
        .split(/[._-]/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
    }

    // Fallback to "AIR User"
    if (!displayName) {
      displayName = "AIR User";
    }

    const profile = {
      name: displayName,
      email: email || "Not provided",
      did:
        userData.id ||
        userData.did ||
        userData.userDid ||
        userData.user?.id ||
        "Not available",
      account:
        walletAccount?.address ||
        userData.wallet?.address ||
        userData.abstractAccountAddress ||
        "Not connected",
      customUserId: customAuth?.customUserId,
      linkedAccounts: userData.linkedAccounts || [],
      raw: userData,
    };

    console.log("✅ getUserProfile - Extracted profile:", profile);
    return profile;
  } catch (error) {
    console.error("❌ Failed to get user profile:", error);
    return null;
  }
}

export async function airIssue(
  credentialId: string,
  credentialSubject: Record<string, unknown>
) {
  const s = await getAirService();
  const jwt = await getPartnerToken("issue");
  const issuerOverride = import.meta.env.VITE_AIR_ISSUER_DID_OVERRIDE?.trim();

  console.log(
    "Issuing against program:",
    credentialId,
    "issuerOverride?:",
    !!issuerOverride
  );

  const params: any = {
    authToken: jwt,
    credentialId,
    credentialSubject,
  };

  // Only include issuerDid if override is provided
  if (issuerOverride) {
    params.issuerDid = issuerOverride;
  }

  return s.issueCredential(params);
}

export async function airVerify(programId: string, redirectUrl?: string) {
  const s = await getAirService();
  const jwt = await getPartnerToken("verify");
  return s.verifyCredential({
    authToken: jwt,
    programId,
    redirectUrl, // e.g., `${location.origin}/issue`
  });
}
