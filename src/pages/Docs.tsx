import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    Book,
    CheckCircle2,
    Code,
    Copy,
    ExternalLink,
    Shield,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Docs() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to integrate AirGate OS into your application
          </p>
        </motion.div>

        {/* Quick Start */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Quick Start
          </h2>
          <Card className="glass border-white/10 p-6">
            <div className="space-y-4">
              <QuickStartStep
                number="1"
                title="Install AIR Kit SDK"
                code="npm install @mocanetwork/airkit"
              />
              <QuickStartStep
                number="2"
                title="Initialize Service"
                code={`import { AirService, BUILD_ENV } from '@mocanetwork/airkit';

const service = new AirService({
  partnerId: 'YOUR_PARTNER_ID'
});

await service.init({
  buildEnv: BUILD_ENV.SANDBOX,
  enableLogging: true,
  skipRehydration: false
});`}
              />
              <QuickStartStep
                number="3"
                title="Authenticate User"
                code={`const user = await service.login();
console.log('User DID:', user.did);`}
              />
            </div>
          </Card>
        </motion.section>

        {/* Core Concepts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            Core Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConceptCard
              title="Decentralized Identifiers (DIDs)"
              description="Self-sovereign identity that users own and control"
              icon={<Shield />}
            />
            <ConceptCard
              title="Verifiable Credentials"
              description="Cryptographically signed claims that can be verified"
              icon={<CheckCircle2 />}
            />
            <ConceptCard
              title="Zero-Knowledge Proofs"
              description="Prove claims without revealing underlying data"
              icon={<Zap />}
            />
            <ConceptCard
              title="On-Chain Anchoring"
              description="Cryptographic proofs anchored on Moca Network"
              icon={<Code />}
            />
          </div>
        </motion.section>

        {/* API Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            API Reference
          </h2>
          <div className="space-y-4">
            <ApiMethod
              method="POST"
              endpoint="/api/issue-credential"
              description="Issue a new verifiable credential"
              params={[
                { name: 'authToken', type: 'string', required: true },
                { name: 'credentialId', type: 'string', required: true },
                { name: 'issuerDid', type: 'string', required: true },
                { name: 'credentialSubject', type: 'object', required: true },
              ]}
            />
            <ApiMethod
              method="POST"
              endpoint="/api/verify-credential"
              description="Verify a credential and generate ZK proof"
              params={[
                { name: 'authToken', type: 'string', required: true },
                { name: 'programId', type: 'string', required: true },
                { name: 'redirectUrl', type: 'string', required: true },
              ]}
            />
          </div>
        </motion.section>

        {/* Environment Variables */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
          <Card className="glass border-white/10 p-6">
            <div className="space-y-3">
              <EnvVar name="VITE_AIR_PARTNER_ID" description="Your AIR partner identifier" />
              <EnvVar name="VITE_AIR_ISSUER_DID" description="Issuer DID for credentials" />
              <EnvVar name="VITE_AIR_VERIFIER_DID" description="Verifier DID for proofs" />
              <EnvVar name="VITE_MOCA_CHAIN_ID" description="Moca Network chain ID (5151)" />
              <EnvVar name="VITE_MOCA_RPC_URL" description="RPC endpoint URL" />
            </div>
          </Card>
        </motion.section>

        {/* Resources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResourceLink
              title="Moca Network Docs"
              url="https://docs.moca.network"
              description="Official Moca Network documentation"
            />
            <ResourceLink
              title="AIR Kit GitHub"
              url="https://github.com/mocanetwork/airkit"
              description="Source code and examples"
            />
            <ResourceLink
              title="Block Explorer"
              url="https://devnet-scan.mocachain.tech"
              description="Explore transactions on-chain"
            />
            <ResourceLink
              title="Support"
              url="mailto:hello@airgateos.com"
              description="Get help from our team"
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function QuickStartStep({ number, title, code }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-l-2 border-primary pl-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-cosmic flex items-center justify-center text-xs font-bold">
            {number}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-accent" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto">
        <code className="text-xs text-accent">{code}</code>
      </pre>
    </div>
  );
}

function ConceptCard({ title, description, icon }: any) {
  return (
    <Card className="glass border-white/10 p-4 hover:shadow-glow transition-all">
      <div className="w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function ApiMethod({ method, endpoint, description, params }: any) {
  return (
    <Card className="glass border-white/10 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Badge className={method === 'POST' ? 'bg-accent' : 'bg-primary'}>
          {method}
        </Badge>
        <div className="flex-1">
          <code className="text-sm font-mono text-foreground">{endpoint}</code>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Parameters:</p>
        {params.map((param: any) => (
          <div key={param.name} className="flex items-center gap-2 text-sm">
            <code className="text-accent">{param.name}</code>
            <span className="text-muted-foreground">({param.type})</span>
            {param.required && (
              <Badge variant="outline" className="text-xs">required</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EnvVar({ name, description }: any) {
  return (
    <div className="p-3 rounded-lg bg-black/20">
      <code className="text-sm text-accent font-mono">{name}</code>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function ResourceLink({ title, url, description }: any) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="glass border-white/10 p-4 hover:shadow-glow transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
        </div>
      </Card>
    </a>
  );
}
