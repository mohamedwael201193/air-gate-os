import { VerifyModal } from "@/components/airgate/VerifyModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calculator,
  CheckCircle2,
  DollarSign,
  Lock,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  demoKey?: "defiJob" | "fanVip" | "traderTier";
  color: string;
  category: "defi" | "governance" | "access" | "tools";
  isExternal?: boolean;
  externalPath?: string;
}

const allDemos: DemoScenario[] = [
  // DeFi Use Cases
  {
    id: "collateral-calculator",
    title: "DeFi Collateral Calculator",
    description:
      "See how verified credentials reduce your collateral requirements by up to 67%. Real-time savings calculator.",
    icon: <DollarSign className="h-6 w-6" />,
    requirements: ["KYC Basic (+50 points)", "Work History (+25 points)"],
    color: "from-blue-500/20 to-cyan-500/20",
    category: "defi",
    isExternal: true,
    externalPath: "/collateral-calculator",
  },
  {
    id: "defi-job",
    title: "DeFi Job Access Gate",
    description:
      "Verify credentials to access exclusive DeFi job opportunities and professional networks.",
    icon: <Briefcase className="h-6 w-6" />,
    requirements: ["KYC Basic Verification", "Work History Credential"],
    demoKey: "defiJob",
    color: "from-purple-500/20 to-pink-500/20",
    category: "defi",
  },
  {
    id: "trader-tier",
    title: "Trader Tier Verification",
    description:
      "Access advanced trading features and lower fees based on verified trading history.",
    icon: <TrendingUp className="h-6 w-6" />,
    requirements: ["KYC Basic Verification", "Trading History"],
    demoKey: "traderTier",
    color: "from-green-500/20 to-emerald-500/20",
    category: "defi",
  },

  // DAO & Governance
  {
    id: "dao-voting",
    title: "Trust-Weighted DAO Voting",
    description:
      "Vote on proposals with power proportional to your trust score. Sybil-resistant governance.",
    icon: <Vote className="h-6 w-6" />,
    requirements: ["Any verified credentials", "Trust Score determines power"],
    color: "from-purple-500/20 to-pink-500/20",
    category: "governance",
    isExternal: true,
    externalPath: "/dao-voting",
  },

  // Access Control
  {
    id: "verify-credential",
    title: "Credential Verification Demo",
    description:
      "Real verification scenarios: Premium Access, Loan Application, Professional Network. See verification in action.",
    icon: <ShieldCheck className="h-6 w-6" />,
    requirements: ["Various credentials for different scenarios"],
    color: "from-blue-500/20 to-cyan-500/20",
    category: "access",
    isExternal: true,
    externalPath: "/verify-credential",
  },
  {
    id: "fan-vip",
    title: "Fan VIP Access",
    description:
      "Prove fan status to unlock exclusive VIP content, events, and community access.",
    icon: <Star className="h-6 w-6" />,
    requirements: ["Fan Badge Credential"],
    demoKey: "fanVip",
    color: "from-amber-500/20 to-orange-500/20",
    category: "access",
  },

  // Tools & Calculators
  {
    id: "trust-score-calculator",
    title: "Trust Score Calculator",
    description:
      "Interactive planner showing what credentials you need for better rates, voting power, and access.",
    icon: <Calculator className="h-6 w-6" />,
    requirements: ["No login required - planning tool"],
    color: "from-purple-500/20 to-pink-500/20",
    category: "tools",
    isExternal: true,
    externalPath: "/trust-score-calculator",
  },
];

export default function Demos() {
  const navigate = useNavigate();
  const { user } = useAirKit();
  const [selectedDemo, setSelectedDemo] = useState<DemoScenario | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const handleDemoClick = (demo: DemoScenario) => {
    if (demo.isExternal && demo.externalPath) {
      navigate(demo.externalPath);
      return;
    }

    if (!user) {
      toast.error("Please connect your AIR identity first");
      navigate("/auth");
      return;
    }
    setSelectedDemo(demo);
  };

  const getFilteredDemos = (category: string) => {
    if (category === "all") return allDemos;
    return allDemos.filter((demo) => demo.category === category);
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
            <span className="gradient-text">Use Case Showcase</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore real-world applications of verifiable credentials across
            DeFi, governance, access control, and more.
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
            <Card className="glass border-white/10 p-6 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-semibold text-amber-500 mb-1">
                    Connect Your AIR Identity
                  </h3>
                  <p className="text-sm text-amber-500/80 mb-3">
                    Connect to unlock interactive demos and verification
                    features
                  </p>
                  <Button
                    onClick={() => navigate("/auth")}
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

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 mb-8 glass p-2 h-auto">
              <TabsTrigger value="all" className="flex items-center gap-2 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">All Demos</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger
                value="defi"
                className="flex items-center gap-2 py-3"
              >
                <DollarSign className="h-4 w-4" />
                DeFi
              </TabsTrigger>
              <TabsTrigger
                value="governance"
                className="flex items-center gap-2 py-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Governance</span>
                <span className="sm:hidden">DAO</span>
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="flex items-center gap-2 py-3"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Access</span>
                <span className="sm:hidden">Access</span>
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="flex items-center gap-2 py-3"
              >
                <Calculator className="h-4 w-4" />
                Tools
              </TabsTrigger>
            </TabsList>

            {/* All Categories */}
            {["all", "defi", "governance", "access", "tools"].map(
              (category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {getFilteredDemos(category).map((demo, index) => (
                      <DemoCard
                        key={demo.id}
                        scenario={demo}
                        onClick={() => handleDemoClick(demo)}
                        disabled={!user && !demo.isExternal}
                        delay={0.1 + index * 0.05}
                      />
                    ))}
                  </div>
                </TabsContent>
              )
            )}
          </Tabs>
        </motion.div>

        {/* VerifyModal */}
        {selectedDemo && selectedDemo.demoKey && (
          <VerifyModal
            isOpen={true}
            onClose={() => setSelectedDemo(null)}
            demoKey={selectedDemo.demoKey}
            title={selectedDemo.title}
            description={selectedDemo.description}
          />
        )}

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
  onClick,
  disabled,
  delay,
}: {
  scenario: DemoScenario;
  onClick: () => void;
  disabled: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card
        className={`glass border-white/10 p-6 h-full flex flex-col transition-all ${
          !disabled || scenario.isExternal
            ? "hover:shadow-glow hover:border-accent/50 cursor-pointer hover:-translate-y-1"
            : "opacity-60"
        }`}
        onClick={disabled && !scenario.isExternal ? undefined : onClick}
      >
        {/* Icon and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${scenario.color} shadow-lg`}
          >
            {scenario.icon}
          </div>
          {scenario.isExternal && (
            <span className="text-xs px-3 py-1 rounded-full bg-gradient-cosmic font-medium">
              Interactive Demo
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-2">{scenario.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 flex-grow">
          {scenario.description}
        </p>

        {/* Requirements */}
        <div className="space-y-2 mb-6 p-3 rounded-lg bg-black/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Requirements
          </p>
          {scenario.requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>{req}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-cosmic hover:shadow-glow font-semibold"
          disabled={disabled && !scenario.isExternal}
          size="lg"
        >
          {scenario.isExternal ? "Launch Demo →" : "Start Verification →"}
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
