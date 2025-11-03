import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trustService } from "@/services/trustService";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Percent,
  Shield,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CollateralCalculator() {
  const navigate = useNavigate();
  const { user } = useAirKit();
  const [loanAmount, setLoanAmount] = useState<string>("1000");
  const [loading, setLoading] = useState(false);
  const [trustProfile, setTrustProfile] = useState<any>(null);

  // Collateral rates based on trust score
  const getCollateralRate = (trustScore: number): number => {
    if (trustScore >= 150) return 50; // 50% collateral
    if (trustScore >= 100) return 75; // 75% collateral
    if (trustScore >= 50) return 100; // 100% collateral
    return 150; // 150% collateral (standard DeFi)
  };

  const getTrustTier = (trustScore: number): string => {
    if (trustScore >= 150) return "Diamond";
    if (trustScore >= 100) return "Platinum";
    if (trustScore >= 50) return "Gold";
    return "Standard";
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const loadTrustData = async () => {
      if (user?.abstractAccountAddress) {
        setLoading(true);
        try {
          const profile = await trustService.getTrustProfile(
            user.abstractAccountAddress
          );
          setTrustProfile(profile);
        } catch (error) {
          console.error("Failed to load trust profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTrustData();
  }, [user, navigate]);

  const trustScore = trustProfile?.trustScore || 0;
  const userRate = getCollateralRate(trustScore);
  const standardRate = 150;
  const trustTier = getTrustTier(trustScore);

  const loanAmountNum = parseFloat(loanAmount) || 0;
  const userCollateral = (loanAmountNum * userRate) / 100;
  const standardCollateral = (loanAmountNum * standardRate) / 100;
  const savings = standardCollateral - userCollateral;
  const savingsPercent = ((savings / standardCollateral) * 100).toFixed(1);

  const hasVerifiedCredentials = trustProfile && trustProfile.proofCount > 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">DeFi Collateral Calculator</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how verified credentials reduce your collateral requirements.
            The more trusted you are, the less you need to lock up.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Trust Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Your Trust Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on verified credentials
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading trust profile...
                </div>
              ) : trustProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-muted-foreground">Trust Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-400">
                        {trustScore}
                      </span>
                      <span className="text-muted-foreground">/200</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-muted-foreground">Tier</span>
                    <Badge
                      className={
                        trustScore >= 150
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : trustScore >= 100
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : trustScore >= 50
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }
                    >
                      {trustTier}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-muted-foreground">
                      Verified Proofs
                    </span>
                    <span className="font-semibold">
                      {trustProfile.proofCount}
                    </span>
                  </div>

                  {trustProfile.proofTypes &&
                    trustProfile.proofTypes.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Credentials:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trustProfile.proofTypes.map((type: string) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="bg-blue-500/10 border-blue-500/30"
                            >
                              {type.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No trust profile found. Get verified to unlock better rates!
                  </p>
                  <Button
                    onClick={() => navigate("/demos")}
                    className="bg-gradient-cosmic hover:shadow-glow"
                  >
                    Get Verified
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-white/10 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Loan Calculator</h3>
                  <p className="text-sm text-muted-foreground">
                    See your collateral requirements
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Loan Amount (USDC)
                  </label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="1000"
                    className="glass"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm">Standard DeFi</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {standardRate}% collateral
                      </div>
                      <div className="font-bold text-red-400">
                        ${standardCollateral.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Your Rate ({trustTier})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {userRate}% collateral
                      </div>
                      <div className="font-bold text-green-400">
                        ${userCollateral.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {hasVerifiedCredentials && savings > 0 && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-green-400">
                        You Save
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      ${savings.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-400/80">
                      {savingsPercent}% less collateral required
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Collateral Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Collateral Tiers
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TierCard
                tier="Standard"
                minScore={0}
                maxScore={49}
                collateral={150}
                color="gray"
                current={trustScore < 50}
              />
              <TierCard
                tier="Gold"
                minScore={50}
                maxScore={99}
                collateral={100}
                color="yellow"
                current={trustScore >= 50 && trustScore < 100}
              />
              <TierCard
                tier="Platinum"
                minScore={100}
                maxScore={149}
                collateral={75}
                color="blue"
                current={trustScore >= 100 && trustScore < 150}
              />
              <TierCard
                tier="Diamond"
                minScore={150}
                maxScore={200}
                collateral={50}
                color="purple"
                current={trustScore >= 150}
              />
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <strong>How it works:</strong> Your trust score is calculated
                  from verified credentials. Higher scores mean more trust,
                  requiring less collateral. This enables capital-efficient
                  borrowing for trusted users while protecting lenders.
                </div>
              </div>
            </div>

            {!hasVerifiedCredentials && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate("/demos")}
                  className="bg-gradient-cosmic hover:shadow-glow"
                >
                  Get Verified to Unlock Better Rates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  minScore,
  maxScore,
  collateral,
  color,
  current,
}: {
  tier: string;
  minScore: number;
  maxScore: number;
  collateral: number;
  color: string;
  current: boolean;
}) {
  const colorMap = {
    gray: "from-gray-500 to-gray-600 border-gray-500/30",
    yellow: "from-yellow-500 to-amber-500 border-yellow-500/30",
    blue: "from-blue-500 to-cyan-500 border-blue-500/30",
    purple: "from-purple-500 to-pink-500 border-purple-500/30",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        current
          ? "glass border-white/20 ring-2 ring-primary"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div
        className={`h-1 rounded-full mb-3 bg-gradient-to-r ${
          colorMap[color as keyof typeof colorMap]
        }`}
      />
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold">{tier}</h4>
        {current && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Current
          </Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground mb-3">
        Score: {minScore}-{maxScore}
      </div>
      <div className="text-2xl font-bold text-primary">{collateral}%</div>
      <div className="text-xs text-muted-foreground">collateral required</div>
    </div>
  );
}
