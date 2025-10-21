import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Globe,
  Key,
  Server,
  Shield,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Docs() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">AirGate OS Documentation</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Complete guide to building privacy-preserving credential
            verification systems with zero-knowledge proofs on Moca Network
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button variant="outline" className="gap-2" asChild>
              <a
                href="https://github.com/mohamedwael201193/air-gate-os"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
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

        {/* Core Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Core Features
          </h2>
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials">Credential Types</TabsTrigger>
              <TabsTrigger value="verification">Verification Gates</TabsTrigger>
              <TabsTrigger value="zk">ZK Proofs</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4 mt-4">
              <FeatureCard
                title="KYC Basic"
                icon={<Shield className="h-5 w-5" />}
                description="Age verification and jurisdiction compliance credential"
                features={[
                  "Verify user age without revealing exact birthdate",
                  "Prove jurisdiction compliance for regulatory requirements",
                  "Basic identity verification with privacy preservation",
                ]}
              />
              <FeatureCard
                title="Work History"
                icon={<Briefcase className="h-5 w-5" />}
                description="Employment verification and experience tracking"
                features={[
                  "Verify employment without revealing salary details",
                  "Prove years of experience in specific roles",
                  "Track professional credentials and certifications",
                ]}
              />
              <FeatureCard
                title="Fan Badges"
                icon={<Star className="h-5 w-5" />}
                description="Event attendance and VIP access credentials"
                features={[
                  "Prove event attendance without revealing personal info",
                  "Unlock VIP experiences and exclusive content",
                  "Track fan engagement and loyalty status",
                ]}
              />
            </TabsContent>

            <TabsContent value="verification" className="space-y-4 mt-4">
              <FeatureCard
                title="DeFi Job Gate"
                icon={<Key className="h-5 w-5" />}
                description="Employment verification for DeFi job opportunities"
                features={[
                  "Requires valid KYC Basic credential",
                  "Verifies work history and experience",
                  "On-chain proof generation and verification",
                ]}
              />
              <FeatureCard
                title="Trader Tier Gate"
                icon={<TrendingUp className="h-5 w-5" />}
                description="KYC verification with tier-based feature unlocking"
                features={[
                  "Basic tier: Standard trading features",
                  "Advanced tier: Leverage and derivatives access",
                  "Professional tier: API access and institutional features",
                ]}
              />
              <FeatureCard
                title="Fan VIP Gate"
                icon={<Star className="h-5 w-5" />}
                description="Event-based access control and VIP verification"
                features={[
                  "Verify fan badge credentials",
                  "Unlock exclusive content and experiences",
                  "Manage event-based access rights",
                ]}
              />
            </TabsContent>

            <TabsContent value="zk" className="space-y-4 mt-4">
              <Card className="glass border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Zero-Knowledge Proof Technology
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AirGate OS uses advanced zero-knowledge proof cryptography to
                  enable privacy-preserving verification. Prove credentials
                  without revealing sensitive underlying data.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Privacy First</p>
                      <p className="text-xs text-muted-foreground">
                        Verify claims without exposing raw credential data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">
                        Cryptographically Secure
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mathematical proofs ensure verification integrity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">
                        On-Chain Verification
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Proofs anchored on Moca Network for transparency
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* Multi-Chain Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Multi-Chain Support
          </h2>
          <Card className="glass border-white/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-accent">Active</Badge>
                  <h3 className="font-semibold">Moca Network (5151)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Primary deployment network for credential verification
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RPC:</span>
                    <code className="text-accent">
                      devnet-rpc.mocachain.org
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Explorer:</span>
                    <a
                      href="https://devnet-scan.mocachain.tech"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      devnet-scan.mocachain.tech
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Coming Soon</Badge>
                  <h3 className="font-semibold">Upcoming Networks</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                    <span>Polygon (137)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                    <span>Ethereum (1)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                    <span>Arbitrum (42161)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* API Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            API Reference
          </h2>
          <div className="space-y-4">
            <ApiMethod
              method="POST"
              endpoint="airService.login()"
              description="Authenticate user and obtain AIR identity"
              params={[{ name: "authToken", type: "string", required: false }]}
            />
            <ApiMethod
              method="POST"
              endpoint="airService.issueCredential()"
              description="Issue a new verifiable credential to user"
              params={[
                { name: "authToken", type: "string", required: true },
                { name: "credentialId", type: "string", required: true },
                { name: "issuerDid", type: "string", required: true },
                { name: "credentialSubject", type: "object", required: true },
              ]}
            />
            <ApiMethod
              method="POST"
              endpoint="airService.verifyCredential()"
              description="Verify a credential and generate ZK proof on-chain"
              params={[
                { name: "authToken", type: "string", required: true },
                { name: "programId", type: "string", required: true },
                { name: "redirectUrl", type: "string", required: false },
              ]}
            />
            <ApiMethod
              method="GET"
              endpoint="getUserProfile()"
              description="Fetch user profile data from AIR login"
              params={[]}
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
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Environment Variables
          </h2>
          <Card className="glass border-white/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <EnvVar
                name="VITE_AIR_PARTNER_ID"
                description="Your AIR partner identifier (required)"
              />
              <EnvVar
                name="VITE_PARTNER_TOKEN_URL"
                description="Backend endpoint for JWT token generation"
              />
              <EnvVar
                name="VITE_ISSUER_PROGRAM_IDS"
                description="JSON mapping of issuer credential program IDs"
              />
              <EnvVar
                name="VITE_VERIFIER_PROGRAM_IDS"
                description="JSON mapping of verifier program IDs"
              />
              <EnvVar
                name="VITE_MOCA_CHAIN_ID"
                description="Moca Network chain ID (5151 for devnet)"
              />
              <EnvVar
                name="VITE_MOCA_RPC_URL"
                description="Moca Network RPC endpoint"
              />
              <EnvVar
                name="VITE_EXPLORER_BASE_URL"
                description="Block explorer URL for transaction viewing"
              />
              <EnvVar
                name="VITE_AIR_ISSUER_DID_OVERRIDE"
                description="Optional issuer DID override for testing"
              />
            </div>
          </Card>
        </motion.section>

        {/* Error Handling & Troubleshooting */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            Error Handling & Troubleshooting
          </h2>
          <Card className="glass border-white/10 p-6">
            <div className="space-y-4">
              <ErrorGuide
                code="AUTH_FAILED"
                description="Authentication token is invalid or expired"
                solution="Refresh authentication token or re-login user"
              />
              <ErrorGuide
                code="CREDENTIAL_EXPIRED"
                description="The credential has passed its expiration date"
                solution="Request a new credential issuance from the issuer"
              />
              <ErrorGuide
                code="ZK_PROOF_INVALID"
                description="Zero-knowledge proof verification failed"
                solution="Regenerate proof with correct credential data"
              />
              <ErrorGuide
                code="UNKNOWN_ISSUER"
                description="Credential issuer DID not recognized or authorized"
                solution="Verify issuer DID matches program ownership and partner authentication is configured"
              />
              <ErrorGuide
                code="UNAVAILABLE_VERIFIER"
                description="Verifier program not deployed on chain or wallet not funded"
                solution="Deploy verifier program on Moca Network (Chain ID 5151) and ensure fee wallet has test $MOCA"
              />
              <ErrorGuide
                code="INCOMPLETE_PARAMETERS"
                description="Required credential fields missing (e.g., credentialSubject.id)"
                solution="Ensure all schema-required fields are included, especially credentialSubject.id with valid URI format"
              />
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
    toast.success("Copied to clipboard");
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
        <Badge className={method === "POST" ? "bg-accent" : "bg-primary"}>
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
              <Badge variant="outline" className="text-xs">
                required
              </Badge>
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
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
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

function FeatureCard({ title, icon, description, features }: any) {
  return (
    <Card className="glass border-white/10 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ErrorGuide({ code, description, solution }: any) {
  return (
    <div className="border-l-2 border-amber-500 pl-4">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-sm font-mono text-amber-500">{code}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-xs text-accent flex items-start gap-2">
        <span className="font-medium">Solution:</span>
        <span>{solution}</span>
      </p>
    </div>
  );
}
