import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Star,
  TrendingUp,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAirKit } from '@/store/useAirKit';
import { credentialService } from '@/services/credentialService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  verifierKey: string;
  requiredCreds: string[];
  color: string;
}

const scenarios: DemoScenario[] = [
  {
    id: 'defi-job',
    title: 'DeFi Job Verification',
    description: 'Verify credentials to access exclusive DeFi job opportunities',
    icon: <Briefcase className="h-6 w-6" />,
    requirements: ['KYC Basic Verification', 'Work History Credential'],
    verifierKey: 'DEFI_JOB_GATE_KYC',
    requiredCreds: ['KYC_BASIC'],
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'fan-vip',
    title: 'Fan VIP Access',
    description: 'Prove fan status to unlock VIP content and experiences',
    icon: <Star className="h-6 w-6" />,
    requirements: ['Fan Badge Credential'],
    verifierKey: 'FAN_VIP_GATE',
    requiredCreds: ['FAN_BADGE'],
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'trader-tier',
    title: 'Trader Tier Verification',
    description: 'Access advanced trading features based on verified experience',
    icon: <TrendingUp className="h-6 w-6" />,
    requirements: ['KYC Basic Verification', 'Trading History'],
    verifierKey: 'TRADER_TIER_GATE',
    requiredCreds: ['KYC_BASIC'],
    color: 'from-green-500/20 to-emerald-500/20',
  },
];

export default function Demos() {
  const navigate = useNavigate();
  const { user, service } = useAirKit();
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleVerify = async (scenario: DemoScenario) => {
    if (!user) {
      toast.error('Please connect your AIR identity first');
      navigate('/auth');
      return;
    }

    setVerifying(scenario.id);

    try {
      // Check if user has required credentials
      const userCreds = credentialService.getCredentials();
      const hasRequiredCreds = scenario.requiredCreds.every((reqCred) =>
        userCreds.some((cred) => cred.type === reqCred && cred.status === 'active')
      );

      // Issue missing credentials if needed
      if (!hasRequiredCreds) {
        toast.info('Issuing required credentials...');
        for (const credType of scenario.requiredCreds) {
          const hasCred = userCreds.some((cred) => cred.type === credType);
          if (!hasCred) {
            await credentialService.issueCredential(service, credType as any, {
              isVerified: true,
              issuedTo: user.did,
              timestamp: Date.now(),
            });
          }
        }
      }

      // Perform verification
      const result = await credentialService.verifyCredential(
        service,
        scenario.verifierKey
      );

      toast.success(
        <div>
          <p className="font-semibold">Verification Successful!</p>
          <p className="text-sm">Proof ID: {result.proofId}</p>
        </div>
      );
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Live Verification Demos</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience real-world verification scenarios powered by zero-knowledge proofs.
            Each demo showcases credential issuance and verification flows.
          </p>
        </motion.div>

        {/* Info Card */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass border-white/10 p-6 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-semibold text-amber-500 mb-1">
                    Connect Your AIR Identity
                  </h3>
                  <p className="text-sm text-amber-500/80 mb-3">
                    You need to connect your AIR identity to try these verification demos
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    size="sm"
                    className="bg-gradient-cosmic hover:shadow-glow"
                  >
                    Connect Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <DemoCard
              key={scenario.id}
              scenario={scenario}
              onVerify={() => handleVerify(scenario)}
              isVerifying={verifying === scenario.id}
              disabled={!user}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            How <span className="gradient-text">Verification</span> Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard
              step="1"
              title="Issue Credentials"
              description="Users receive verifiable credentials from trusted issuers"
            />
            <StepCard
              step="2"
              title="Generate Proof"
              description="Zero-knowledge proof is created without revealing raw data"
            />
            <StepCard
              step="3"
              title="Verify On-Chain"
              description="Proof is verified cryptographically on Moca Network"
            />
            <StepCard
              step="4"
              title="Grant Access"
              description="Access is granted based on verified claims"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DemoCard({
  scenario,
  onVerify,
  isVerifying,
  disabled,
  delay,
}: {
  scenario: DemoScenario;
  onVerify: () => void;
  isVerifying: boolean;
  disabled: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`glass border-white/10 p-6 h-full flex flex-col bg-gradient-to-br ${scenario.color} hover:shadow-glow transition-all`}
      >
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-cosmic flex items-center justify-center mb-4">
            {scenario.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
        </div>

        <div className="mb-4 flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Required Credentials:
          </p>
          <div className="space-y-1">
            {scenario.requirements.map((req) => (
              <div key={req} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-accent flex-shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onVerify}
          disabled={disabled || isVerifying}
          className="w-full bg-gradient-cosmic hover:shadow-glow"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Start Verification'
          )}
        </Button>
      </Card>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="glass border-white/10 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-cosmic flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {step}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
