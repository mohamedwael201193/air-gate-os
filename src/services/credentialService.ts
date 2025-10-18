import { airIssue, airVerify } from '@/air/airkit';
import { getIssuerId, getVerifierId } from '@/air/programs';

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
  async issueCredential(
    _service: any, // Not used anymore, kept for compatibility
    type: 'KYC_BASIC' | 'WORK_HISTORY' | 'FAN_BADGE',
    data: any
  ): Promise<CredentialData> {
    try {
      const credentialId = getIssuerId(type);
      
      const result = await airIssue(credentialId, data, import.meta.env.VITE_AIR_ISSUER_DID);

      const credential: CredentialData = {
        id: (result as any)?.id || `cred_${Date.now()}`,
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
    _service: any, // Not used anymore, kept for compatibility
    verifierKey: string
  ): Promise<VerificationRecord> {
    try {
      const programId = getVerifierId(verifierKey as any);
      
      const result = await airVerify(programId, import.meta.env.VITE_REDIRECT_URL || window.location.origin + '/callback');

      // Modern AIR Kit returns { status, txHash } format, not proofId
      const record: VerificationRecord = {
        id: `verify_${Date.now()}`,
        type: verifierKey,
        status: (result as any)?.status === 'verified' || (result as any)?.status === 'success' ? 'success' : 'failed',
        timestamp: Date.now(),
        proofId: (result as any)?.transactionHash || (result as any)?.txHash || `tx_${Date.now()}`, // Use txHash as proof
        txHash: (result as any)?.transactionHash || (result as any)?.txHash
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
