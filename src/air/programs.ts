// Program ID management for AIR Kit credentials and verifiers

export function getIssuerId(type: "KYC_BASIC" | "WORK_HISTORY" | "FAN_BADGE"): string {
  const programIds = getIssuerProgramIds();
  const id = programIds[type];
  if (!id) {
    throw new Error(`Unknown issuer credential type: ${type}`);
  }
  return id;
}

export function getVerifierId(type: "DEFI_JOB_GATE_KYC" | "DEFI_JOB_GATE_WORK" | "FAN_VIP_GATE" | "TRADER_TIER_GATE"): string {
  const programIds = getVerifierProgramIds();
  const id = programIds[type];
  if (!id) {
    throw new Error(`Unknown verifier program type: ${type}`);
  }
  return id;
}

function getIssuerProgramIds() {
  try {
    return JSON.parse(import.meta.env.VITE_ISSUER_PROGRAM_IDS || '{}');
  } catch {
    // Fallback IDs for development
    return {
      KYC_BASIC: 'c21s90g0pcu4m00C2599ez',
      WORK_HISTORY: 'c21s90g0pe1vl00d99732s',
      FAN_BADGE: 'c21s90g0pf0lb00e8395zm'
    };
  }
}

function getVerifierProgramIds() {
  try {
    return JSON.parse(import.meta.env.VITE_VERIFIER_PROGRAM_IDS || '{}');
  } catch {
    // Fallback IDs for development
    return {
      DEFI_JOB_GATE_KYC: 'c21s9030ptsdv004534lxx',
      DEFI_JOB_GATE_WORK: 'c21s9030qfcmm005534IFW',
      FAN_VIP_GATE: 'c21s9030qlq2y0065341JX',
      TRADER_TIER_GATE: 'c21s9030qnpvw0075341e7'
    };
  }
}
