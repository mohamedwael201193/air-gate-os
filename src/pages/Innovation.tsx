import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Shield, Lock, Eye, Calculator, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Innovation() {
  const [privacyScore, setPrivacyScore] = useState(85);
  const [kycCost, setKycCost] = useState(25);
  const [volumePerMonth, setVolumePerMonth] = useState(1000);

  const traditionalCost = kycCost * volumePerMonth;
  const airgateCost = 0.01 * volumePerMonth;
  const savings = traditionalCost - airgateCost;
  const savingsPercent = Math.round(((savings / traditionalCost) * 100));

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
            <span className="gradient-text">Innovation Showcase</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore cutting-edge features that set AirGate OS apart from traditional verification systems
          </p>
        </motion.div>

        {/* Visual Rule Composer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Visual Rule Composer
          </h2>
          <Card className="glass border-white/10 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <p className="text-muted-foreground mb-6">
              Create complex verification rules with an intuitive drag-and-drop interface.
              No coding required!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <RuleBlock
                title="Age Requirement"
                type="condition"
                color="blue"
                content="Age >= 18"
              />
              <RuleBlock
                title="Jurisdiction"
                type="condition"
                color="purple"
                content="Country NOT IN [US, CN]"
              />
              <RuleBlock
                title="KYC Level"
                type="condition"
                color="green"
                content="Level >= BASIC"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => toast.success('Rule exported successfully!')}
                className="bg-gradient-cosmic hover:shadow-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info('Smart contract code copied!')}
                className="border-white/20"
              >
                Generate Smart Contract
              </Button>
            </div>
          </Card>
        </motion.section>

        {/* Privacy Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            Privacy Dashboard
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10 p-8">
              <h3 className="text-xl font-semibold mb-4">Zero-Knowledge Proof Visualization</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Data Minimization</span>
                    <span className="text-sm font-semibold text-accent">95%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                      style={{ width: '95%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Privacy Preservation</span>
                    <span className="text-sm font-semibold text-accent">98%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                      style={{ width: '98%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Verification Confidence</span>
                    <span className="text-sm font-semibold text-accent">100%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass border-white/10 p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <h3 className="text-xl font-semibold mb-4">Privacy Score Calculator</h3>
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Adjust Privacy Settings
                </label>
                <Slider
                  value={[privacyScore]}
                  onValueChange={(value) => setPrivacyScore(value[0])}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Basic</span>
                  <span>Enhanced</span>
                  <span>Maximum</span>
                </div>
              </div>
              <div className="text-center p-6 rounded-lg bg-black/20">
                <div className="text-5xl font-bold gradient-text mb-2">{privacyScore}</div>
                <div className="text-sm text-muted-foreground">Privacy Score</div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent" />
                  <span>{privacyScore > 80 ? 'Maximum' : privacyScore > 50 ? 'Enhanced' : 'Basic'} data protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <span>Zero-knowledge proofs enabled</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* ROI Calculator */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            ROI Calculator
          </h2>
          <Card className="glass border-white/10 p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Traditional KYC Cost (per verification)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">$</span>
                  <Input
                    type="number"
                    value={kycCost}
                    onChange={(e) => setKycCost(Number(e.target.value))}
                    className="glass border-white/10 text-2xl font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Monthly Verification Volume
                </label>
                <Input
                  type="number"
                  value={volumePerMonth}
                  onChange={(e) => setVolumePerMonth(Number(e.target.value))}
                  className="glass border-white/10 text-2xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-lg bg-black/20 text-center">
                <div className="text-sm text-muted-foreground mb-2">Traditional Cost</div>
                <div className="text-3xl font-bold text-destructive">
                  ${traditionalCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">per month</div>
              </div>
              <div className="p-6 rounded-lg bg-black/20 text-center">
                <div className="text-sm text-muted-foreground mb-2">AirGate Cost</div>
                <div className="text-3xl font-bold text-accent">
                  ${airgateCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">per month</div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-cosmic text-center">
                <div className="text-sm text-white/80 mb-2">Your Savings</div>
                <div className="text-3xl font-bold text-white">
                  ${savings.toLocaleString()}
                </div>
                <div className="text-xs text-white/80 mt-1">{savingsPercent}% reduction</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => toast.success('Report downloaded!')}
                className="bg-gradient-cosmic hover:shadow-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info('Presentation exported!')}
                className="border-white/20"
              >
                Export for Stakeholders
              </Button>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}

function RuleBlock({
  title,
  type,
  color,
  content,
}: {
  title: string;
  type: string;
  color: string;
  content: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  };

  return (
    <div
      className={`p-4 rounded-lg border bg-gradient-to-br ${
        colorClasses[color as keyof typeof colorClasses]
      } hover:shadow-glow transition-all cursor-move`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {type}
        </span>
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <code className="text-xs text-accent">{content}</code>
    </div>
  );
}
