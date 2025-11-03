import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Award,
  Calculator,
  CheckCircle2,
  Github,
  Shield,
  Sparkles,
  Twitter,
  Wallet,
} from "lucide-react";
import { useState } from "react";

interface CredentialOption {
  id: string;
  name: string;
  icon: any;
  points: number;
  description: string;
  color: string;
}

export default function TrustScoreCalculator() {
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);

  const credentials: CredentialOption[] = [
    {
      id: "kyc_basic",
      name: "KYC Basic",
      icon: Shield,
      points: 50,
      description: "Identity verification with government ID",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "work_history",
      name: "Work History",
      icon: Award,
      points: 25,
      description: "Professional employment verification",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "fan_badge",
      name: "Fan Badge",
      icon: Sparkles,
      points: 15,
      description: "Community membership verification",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "github",
      name: "GitHub Profile",
      icon: Github,
      points: 20,
      description: "Developer identity verification",
      color: "from-gray-600 to-gray-800",
    },
    {
      id: "twitter",
      name: "Twitter/X Account",
      icon: Twitter,
      points: 10,
      description: "Social media verification",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "wallet_age",
      name: "Wallet Age (>1yr)",
      icon: Wallet,
      points: 15,
      description: "Established blockchain presence",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const toggleCredential = (id: string) => {
    setSelectedCredentials((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateTotalScore = () => {
    return credentials
      .filter((c) => selectedCredentials.includes(c.id))
      .reduce((sum, c) => sum + c.points, 0);
  };

  const getTier = (score: number) => {
    if (score >= 80) return { name: "Diamond", color: "text-cyan-400" };
    if (score >= 60) return { name: "Platinum", color: "text-purple-400" };
    if (score >= 40) return { name: "Gold", color: "text-yellow-400" };
    return { name: "Standard", color: "text-gray-400" };
  };

  const getCollateralRate = (score: number) => {
    if (score >= 80) return 50;
    if (score >= 60) return 75;
    if (score >= 40) return 100;
    return 150;
  };

  const getVotingPower = (score: number) => {
    return Math.min(100, score);
  };

  const totalScore = calculateTotalScore();
  const tier = getTier(totalScore);
  const collateralRate = getCollateralRate(totalScore);
  const votingPower = getVotingPower(totalScore);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cosmic mb-6">
            <Calculator className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Trust Score Calculator</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Plan your credentials strategy. See exactly what credentials you
            need to unlock better rates, voting power, and access levels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Credential Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10 p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-accent" />
                Select Your Credentials
              </h2>
              <div className="space-y-3">
                {credentials.map((credential, index) => (
                  <motion.div
                    key={credential.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    onClick={() => toggleCredential(credential.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${
                        selectedCredentials.includes(credential.id)
                          ? "border-accent bg-accent/10 shadow-glow"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCredentials.includes(credential.id)}
                        onCheckedChange={() => toggleCredential(credential.id)}
                        className="pointer-events-none"
                      />
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${credential.color}`}
                      >
                        <credential.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">
                            {credential.name}
                          </span>
                          <span className="text-accent font-bold">
                            +{credential.points}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {credential.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right: Results & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Total Score Card */}
            <Card className="glass border-white/10 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <h2 className="text-lg font-semibold mb-4">Your Trust Score</h2>
              <div className="text-center mb-6">
                <div className="text-7xl font-bold gradient-text mb-2">
                  {totalScore}
                </div>
                <div className="text-muted-foreground">out of 155 points</div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className={`h-6 w-6 ${tier.color}`} />
                <span className={`text-2xl font-bold ${tier.color}`}>
                  {tier.name} Tier
                </span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                  style={{ width: `${(totalScore / 155) * 100}%` }}
                />
              </div>
            </Card>

            {/* Benefits Card */}
            <Card className="glass border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Your Benefits</h2>
              <div className="space-y-4">
                {/* DeFi Collateral */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      DeFi Collateral Rate
                    </span>
                    <span className="text-2xl font-bold text-blue-400">
                      {collateralRate}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {collateralRate === 50
                      ? "🎉 Best rate! 67% less collateral than standard"
                      : collateralRate === 75
                      ? "50% less collateral than standard"
                      : collateralRate === 100
                      ? "33% less collateral than standard"
                      : "Standard rate - get verified for better rates"}
                  </p>
                </div>

                {/* Voting Power */}
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      DAO Voting Power
                    </span>
                    <span className="text-2xl font-bold text-purple-400">
                      {votingPower}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {votingPower >= 80
                      ? "🏆 Maximum voting influence - can vote on all proposals"
                      : votingPower >= 50
                      ? "✅ Strong voting power - can participate in governance"
                      : votingPower > 0
                      ? "📊 Basic voting rights - build trust for more influence"
                      : "❌ No voting power - get credentials to participate"}
                  </p>
                </div>

                {/* Access Levels */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Access Level</span>
                    <span className="text-2xl font-bold text-green-400">
                      {totalScore >= 60
                        ? "VIP"
                        : totalScore >= 30
                        ? "Premium"
                        : "Basic"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalScore >= 60
                      ? "🌟 Full access to all features and exclusive content"
                      : totalScore >= 30
                      ? "⭐ Premium features unlocked"
                      : "🔒 Limited access - verify credentials to unlock more"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="glass border-blue-500/30 bg-blue-500/10 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Next Steps
              </h3>
              <div className="space-y-2 text-sm">
                {totalScore < 50 && (
                  <p className="text-muted-foreground">
                    💡 Get KYC Basic verification (+50 points) to unlock
                    significant benefits
                  </p>
                )}
                {totalScore >= 50 && totalScore < 80 && (
                  <p className="text-muted-foreground">
                    💡 Add Work History (+25) or GitHub (+20) to reach Diamond
                    tier
                  </p>
                )}
                {totalScore >= 80 && (
                  <p className="text-muted-foreground">
                    🎉 You've unlocked Diamond tier! Enjoy the best rates and
                    maximum voting power
                  </p>
                )}
              </div>
              <Button className="w-full mt-4 bg-gradient-cosmic hover:shadow-glow">
                Get Started with Verification
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="glass border-white/10 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              How Trust Scores Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">1. Get Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Choose and complete verifications that matter to you. Each
                  credential adds to your trust score.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                  <Calculator className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">2. Build Your Score</h3>
                <p className="text-sm text-muted-foreground">
                  Your trust score is calculated from all your verified
                  credentials. More verifications = higher score.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">3. Unlock Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Use your trust score across DeFi, DAOs, and dApps for better
                  rates, voting power, and access.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
