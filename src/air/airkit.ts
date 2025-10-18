import { AirService, BUILD_ENV } from "@mocanetwork/airkit";

let svc: AirService | null = null;
let initialized = false;

export async function getAirService() {
  if (!svc) {
    svc = new AirService({ partnerId: import.meta.env.VITE_AIR_PARTNER_ID });
  }
  if (!initialized) {
    await svc.init({
      buildEnv: BUILD_ENV.SANDBOX,   // testnet/sandbox per docs
      enableLogging: true, // Always enable logging to debug issues
      skipRehydration: false,
      // do NOT pass environmentConfig/widgetUrl/apiUrl here
    });
    initialized = true;
  }
  return svc;
}

async function getPartnerToken(scope: "login"|"issue"|"verify" = "verify") {
  try {
    const url = `${import.meta.env.VITE_PARTNER_TOKEN_URL}?scope=${scope}`;
    console.log('🔵 Fetching partner token for scope:', scope);
    const r = await fetch(url, { 
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!r.ok) throw new Error(`partner-token ${scope} failed: ${r.status}`);
    const token = await r.text();
    console.log('✅ Partner token obtained for scope:', scope);
    return token;
  } catch (error) {
    console.error(`❌ Failed to get partner token for scope ${scope}:`, error);
    // For development, return a placeholder token
    if (import.meta.env.MODE === 'development') {
      console.warn('🟡 Using placeholder token for development');
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
    console.log('🔵 Starting AIR login...');
    const result = await s.login();
    console.log('✅ AIR login successful:', result);
    console.log('📝 Login result type:', typeof result);
    console.log('📝 Login result keys:', Object.keys(result || {}));
    
    // Force showing the full object structure
    console.group('� FULL USER OBJECT DETAILS:');
    console.log('Raw object:', result);
    console.log('JSON string:', JSON.stringify(result, null, 2));
    if (result) {
      Object.keys(result).forEach(key => {
        console.log(`  ${key}:`, (result as any)[key]);
      });
    }
    console.groupEnd();
    
    console.log('📝 User DID:', (result as any)?.id || (result as any)?.did || (result as any)?.userDid || 'NOT FOUND');
    return result;
  } catch (error) {
    console.error('❌ AIR login failed:', error);
    throw error;
  }
}

export async function airIssue(credentialId: string, subject: Record<string,unknown>, issuerDid?: string) {
  const s = await getAirService();
  const jwt = await getPartnerToken("issue");
  return s.issueCredential({
    authToken: jwt,
    credentialId,
    credentialSubject: subject,
    issuerDid: issuerDid || import.meta.env.VITE_AIR_ISSUER_DID,
  });
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
