interface CredentialData {
  id: string;
  type: string;
  issuedAt: number;
  status: 'active' | 'revoked' | 'expired';
  data: any;
}

interface VerificationRecord {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  proofId: string;
  txHash?: string;
}

export class CredentialService {
  private getProgramIds() {
    try {
      return JSON.parse(import.meta.env.VITE_ISSUER_PROGRAM_IDS || '{}');
    } catch {
      return {
        KYC_BASIC: 'c21s90g0pcu4m00C2599ez',
        WORK_HISTORY: 'c21s90g0pe1vl00d99732s',
        FAN_BADGE: 'c21s90g0pf0lb00e8395zm'
      };
    }
  }

  private getVerifierIds() {
    try {
      return JSON.parse(import.meta.env.VITE_VERIFIER_PROGRAM_IDS || '{}');
    } catch {
      return {
        DEFI_JOB_GATE_KYC: 'c21s9030ptsdv004534lxx',
        DEFI_JOB_GATE_WORK: 'c21s9030qfcmm005534IFW',
        FAN_VIP_GATE: 'c21s9030qlq2y0065341JX',
        TRADER_TIER_GATE: 'c21s9030qnpvw0075341e7'
      };
    }
  }

  async getPartnerToken(scope: string = 'issue'): Promise<string> {
    try {
      const response = await fetch(
        import.meta.env.VITE_PARTNER_TOKEN_URL || 'https://airgate-keys.vercel.app/api/partner-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get partner token');
      }
      
      return await response.text();
    } catch (error) {
      console.error('Failed to get partner token:', error);
      return 'mock-token-' + Date.now();
    }
  }

  async issueCredential(
    service: any,
    type: 'KYC_BASIC' | 'WORK_HISTORY' | 'FAN_BADGE',
    data: any
  ): Promise<CredentialData> {
    const programIds = this.getProgramIds();
    const credentialId = programIds[type];
    
    try {
      const token = await this.getPartnerToken('issue');
      
      const result = await service.issueCredential({
        authToken: token,
        credentialId,
        issuerDid: import.meta.env.VITE_AIR_ISSUER_DID,
        credentialSubject: data
      });

      const credential: CredentialData = {
        id: result.id || `cred_${Date.now()}`,
        type,
        issuedAt: Date.now(),
        status: 'active',
        data: result
      };

      this.storeCredential(credential);
      return credential;
    } catch (error) {
      console.error('Failed to issue credential:', error);
      throw error;
    }
  }

  async verifyCredential(
    service: any,
    verifierKey: string
  ): Promise<VerificationRecord> {
    const verifierIds = this.getVerifierIds();
    const programId = verifierIds[verifierKey as keyof typeof verifierIds];

    try {
      const token = await this.getPartnerToken('verify');
      
      const result = await service.verifyCredential({
        authToken: token,
        programId,
        redirectUrl: import.meta.env.VITE_REDIRECT_URL || window.location.origin + '/callback'
      });

      // Modern AIR Kit returns { status, txHash } format, not proofId
      const record: VerificationRecord = {
        id: `verify_${Date.now()}`,
        type: verifierKey,
        status: result.status === 'verified' || result.status === 'success' ? 'success' : 'failed',
        timestamp: Date.now(),
        proofId: result.transactionHash || result.txHash || `tx_${Date.now()}`, // Use txHash as proof
        txHash: result.transactionHash || result.txHash
      };

      this.storeVerification(record);
      return record;
    } catch (error) {
      console.error('Failed to verify credential:', error);
      throw error;
    }
  }

  getCredentials(): CredentialData[] {
    try {
      const stored = localStorage.getItem('airgate_credentials');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getVerificationHistory(): VerificationRecord[] {
    try {
      const stored = localStorage.getItem('airgate_verifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeCredential(credential: CredentialData) {
    const credentials = this.getCredentials();
    credentials.push(credential);
    localStorage.setItem('airgate_credentials', JSON.stringify(credentials));
  }

  private storeVerification(record: VerificationRecord) {
    const history = this.getVerificationHistory();
    history.push(record);
    localStorage.setItem('airgate_verifications', JSON.stringify(history));
  }

  getStatistics() {
    const credentials = this.getCredentials();
    const verifications = this.getVerificationHistory();
    
    return {
      totalCredentials: credentials.length,
      activeCredentials: credentials.filter(c => c.status === 'active').length,
      totalVerifications: verifications.length,
      successfulVerifications: verifications.filter(v => v.status === 'success').length,
      successRate: verifications.length > 0
        ? Math.round((verifications.filter(v => v.status === 'success').length / verifications.length) * 100)
        : 0
    };
  }
}

export const credentialService = new CredentialService();
