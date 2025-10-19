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
    const userInfo = {
      id:
        (result as any)?.id || (result as any)?.did || (result as any)?.userDid,
      email:
        (result as any)?.email ||
        (result as any)?.linkedAccounts?.find(
          (acc: any) => acc.type === "email"
        )?.address,
      ...result,
    };

    console.log("📧 User Email:", userInfo.email || "NOT FOUND");
    localStorage.setItem("airUser", JSON.stringify(userInfo));

    return userInfo;
  } catch (error) {
    console.error("❌ AIR login failed:", error);
    throw error;
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
