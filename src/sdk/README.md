# AirGate SDK

Lightweight TypeScript SDK for integrating on-chain trust verification into your applications.

## 🚀 Quick Start

```typescript
import { getTrustScore, verifyAddress } from "@/sdk/airgate";

// Check trust score
const score = await getTrustScore("0x1234...");
console.log(`Trust score: ${score}`);

// Verify specific credential
const hasKYC = await verifyAddress("0x1234...", "KYC");
if (hasKYC) {
  console.log("✅ KYC verified");
}
```

## 📦 Installation

Simply copy the SDK files to your project:

```bash
# If using this project
import { getTrustScore } from '@/sdk/airgate';

# Or copy airgate.ts to your project
cp src/sdk/airgate.ts your-project/sdk/
```

## 🔧 Core Functions

### `getTrustScore(address: string): Promise<number>`

Get the trust score for an Ethereum address.

**Returns:** Trust score (0-300+), or 0 if no profile found

```typescript
const score = await getTrustScore("0x...");
```

### `getTrustProfile(address: string): Promise<TrustProfile | null>`

Get complete trust profile including all credentials and metadata.

**Returns:**

```typescript
{
  trustScore: number;
  proofTypes: string[];
  endorsementCount: number;
  lastActivityTimestamp: number;
}
```

### `verifyAddress(address: string, proofType: string): Promise<boolean>`

Check if an address has a specific credential proof.

**Proof Types:**

- `KYC` - Know Your Customer verification
- `WORK_HISTORY` - Employment history proof
- `EDUCATION` - Educational credentials
- `SKILL` - Skill certifications
- `COMMUNITY` - Community participation
- `PROFESSIONAL_LICENSE` - Professional licenses

```typescript
const hasKYC = await verifyAddress("0x...", "KYC");
const hasWork = await verifyAddress("0x...", "WORK_HISTORY");
```

### `getProofTypes(address: string): Promise<string[]>`

Get all verified proof types for an address.

```typescript
const proofs = await getProofTypes("0x...");
// ['KYC', 'WORK_HISTORY', 'COMMUNITY']
```

### `getTrustLevel(score: number): string`

Convert numeric trust score to human-readable label.

**Trust Levels:**

- **Exceptional** (200+)
- **Excellent** (150-199)
- **Very Good** (100-149)
- **Good** (50-99)
- **Fair** (30-49)
- **Limited** (0-29)

```typescript
const level = getTrustLevel(150);
// 'Excellent'
```

### `getVerificationUrl(address: string, baseUrl?: string): string`

Generate a shareable verification URL.

```typescript
const url = getVerificationUrl("0x...");
// 'https://airgate-os.vercel.app/verify/0x...'
```

## 💡 Usage Examples

### Example 1: Job Application Filter

```typescript
import { getTrustScore, verifyAddress } from "@/sdk/airgate";

async function checkApplicant(address: string) {
  const MINIMUM_SCORE = 50;
  const score = await getTrustScore(address);
  const hasKYC = await verifyAddress(address, "KYC");
  const hasWork = await verifyAddress(address, "WORK_HISTORY");

  if (score >= MINIMUM_SCORE && hasKYC && hasWork) {
    return { qualified: true, score };
  }

  return { qualified: false, score };
}
```

### Example 2: Display Trust Badge

```typescript
import { getTrustProfile, getTrustLevel } from "@/sdk/airgate";

async function displayTrustBadge(address: string) {
  const profile = await getTrustProfile(address);

  if (!profile) {
    return "<span>No Trust Profile</span>";
  }

  const level = getTrustLevel(profile.trustScore);

  return `
    <div class="trust-badge">
      <span class="trust-level">${level}</span>
      <span class="trust-score">${profile.trustScore}</span>
      <span class="credentials">${profile.proofTypes.join(", ")}</span>
    </div>
  `;
}
```

### Example 3: Batch Verification

```typescript
import { getTrustScore } from "@/sdk/airgate";

async function rankCandidates(addresses: string[]) {
  const scores = await Promise.all(
    addresses.map(async (address) => ({
      address,
      score: await getTrustScore(address),
    }))
  );

  return scores.sort((a, b) => b.score - a.score);
}
```

### Example 4: React Hook

```typescript
import { getTrustProfile } from "@/sdk/airgate";
import { useEffect, useState } from "react";

function useTrustProfile(address: string) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    getTrustProfile(address)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [address]);

  return { profile, loading };
}
```

## 📋 Configuration

### SDK_CONFIG

Access contract and network details:

```typescript
import { SDK_CONFIG } from "@/sdk/airgate";

console.log(SDK_CONFIG);
// {
//   contractAddress: '0x77F97D9a76F4c262c2235FD9b7F418A7c0C75D10',
//   rpcUrl: 'https://devnet-rpc.mocachain.org',
//   chainId: 5151,
//   explorerUrl: 'https://devnet-scan.mocachain.tech',
//   network: 'Moca Devnet'
// }
```

## 🔗 Integration Patterns

### Pattern 1: Gated Access

```typescript
async function checkGateAccess(address: string, requiredProofs: string[]) {
  for (const proof of requiredProofs) {
    const has = await verifyAddress(address, proof);
    if (!has) return false;
  }
  return true;
}
```

### Pattern 2: Trust-Based Pricing

```typescript
async function calculateDiscount(address: string) {
  const score = await getTrustScore(address);

  if (score >= 150) return 0.2; // 20% off
  if (score >= 100) return 0.15; // 15% off
  if (score >= 50) return 0.1; // 10% off
  return 0;
}
```

### Pattern 3: Reputation Display

```typescript
async function getUserReputation(address: string) {
  const profile = await getTrustProfile(address);

  if (!profile) return null;

  return {
    stars: Math.min(5, Math.floor(profile.trustScore / 40)),
    level: getTrustLevel(profile.trustScore),
    badges: profile.proofTypes.length,
    endorsements: profile.endorsementCount,
  };
}
```

## 🛡️ Security Considerations

- **On-Chain Verification**: All data is read directly from the Moca blockchain
- **Immutable Records**: Credentials cannot be tampered with
- **Zero-Knowledge Proofs**: Users prove claims without revealing data
- **No API Keys**: SDK queries blockchain directly (no rate limits)

## 📚 Full API Reference

See `examples.ts` for comprehensive usage examples including:

- Batch candidate verification
- Employment credential checks
- Shareable verification badges
- React integration patterns

## 🌐 Links

- **Live Demo**: https://airgate-os.vercel.app
- **Docs**: https://airgate-os.vercel.app/docs
- **Public Verification**: https://airgate-os.vercel.app/verify/{address}
- **Explorer**: https://devnet-scan.mocachain.tech
- **Contract**: `0x77F97D9a76F4c262c2235FD9b7F418A7c0C75D10`

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

- GitHub Issues: https://github.com/mohamedwael201193/air-gate-os
- Email: hello@airgateos.com
