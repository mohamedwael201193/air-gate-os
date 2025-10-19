// Program ID management for AIR Kit credentials and verifiers

export function getIssuerId(
  type: "KYC_BASIC" | "WORK_HISTORY" | "FAN_BADGE"
): string {
  const programIds = getIssuerProgramIds();
  const id = programIds[type];
  if (!id) {
    throw new Error(`Unknown issuer credential type: ${type}`);
  }
  return id;
}

export function getVerifierId(
  type:
    | "DEFI_JOB_GATE_KYC"
    | "DEFI_JOB_GATE_WORK"
    | "FAN_VIP_GATE"
    | "TRADER_TIER_GATE"
): string {
  const programIds = getVerifierProgramIds();
  const id = programIds[type];
  if (!id) {
    throw new Error(`Unknown verifier program type: ${type}`);
  }
  return id;
}

function loadJsonEnv<T = any>(key: string): T {
  const raw = (import.meta.env[key] ?? "").toString().trim();
  // strip accidental surrounding quotes
  const cleaned = raw.replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, "");
  if (!cleaned) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(`Env ${key} is not valid JSON. Value: ${raw.slice(0, 60)}`);
  }
}

function getIssuerProgramIds() {
  return loadJsonEnv<Record<string, string>>("VITE_ISSUER_PROGRAM_IDS");
}

function getVerifierProgramIds() {
  return loadJsonEnv<Record<string, string>>("VITE_VERIFIER_PROGRAM_IDS");
}
