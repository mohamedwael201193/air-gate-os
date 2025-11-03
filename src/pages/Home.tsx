import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { credentialService } from "@/services/credentialService";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [stats, setStats] = useState({
    totalCredentials: 0,
    totalVerifications: 0,
    successRate: 0,
  });

  const [blockchainStats, setBlockchainStats] = useState({
    totalProofsOnChain: 0,
    totalUsersOnChain: 0,
    averageProofsPerUser: "0",
  });

  useEffect(() => {
    // Get local statistics
    const statistics = credentialService.getStatistics();
    setStats(statistics);

    // Get blockchain statistics
    credentialService.getBlockchainStatistics().then((bcStats) => {
      setBlockchainStats(bcStats);
    });
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-6">
            <Shield className="h-20 w-20 text-primary animate-float" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Drop-in Eligibility</span>
            <br />
            <span className="text-foreground">
              Powered by Zero-Knowledge Proofs
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your verification infrastructure with AirGate OS. Issue
            and verify credentials without compromising user privacy, powered by
            Moca Network's AIR Kit.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg px-8"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demos">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/5 text-lg px-8"
              >
                View Demos
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            icon={<Shield />}
            value={blockchainStats.totalProofsOnChain}
            label="Proofs On-Chain"
            subtitle="Live from Moca Network"
            delay={0.1}
          />
          <StatsCard
            icon={<Users />}
            value={blockchainStats.totalUsersOnChain}
            label="Verified Users"
            subtitle="Unique wallet addresses"
            delay={0.2}
          />
          <StatsCard
            icon={<CheckCircle />}
            value={blockchainStats.averageProofsPerUser}
            label="Avg Proofs/User"
            subtitle="Trust score growth"
            delay={0.3}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why <span className="gradient-text">AirGate OS</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            The future of identity verification is here
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Lock />}
            title="Privacy-First"
            description="Zero-knowledge proofs ensure user data stays private while proving claims"
            delay={0.1}
          />
          <FeatureCard
            icon={<Zap />}
            title="Lightning Fast"
            description="Verify credentials in milliseconds, not days. 99.9% faster than traditional KYC"
            delay={0.2}
          />
          <FeatureCard
            icon={<Shield />}
            title="Trustless Verification"
            description="No central authority needed. Cryptographic proofs you can verify on-chain"
            delay={0.3}
          />
          <FeatureCard
            icon={<Users />}
            title="User-Controlled"
            description="Users own their credentials and choose what to share, when to share"
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap />}
            title="Cost Effective"
            description="$0.01 per verification vs $15-50 for traditional KYC. 99% cost reduction"
            delay={0.5}
          />
          <FeatureCard
            icon={<CheckCircle />}
            title="Compliant"
            description="Meet regulatory requirements while maintaining user privacy"
            delay={0.6}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="glass border-white/10 p-12 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Verification Flow?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join the future of Web3 identity. Start issuing and verifying
            credentials in minutes.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg px-8"
            >
              Connect AIR Identity <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}

function StatsCard({ icon, value, label, subtitle, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Card className="glass border-white/10 p-6 text-center hover:shadow-glow transition-all">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-cosmic mb-4">
          {icon}
        </div>
        <div className="text-4xl font-bold gradient-text mb-2">{value}</div>
        <div className="text-muted-foreground font-medium">{label}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/70 mt-1">
            {subtitle}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Card className="glass border-white/10 p-6 hover:shadow-glow transition-all h-full">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-cosmic mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  );
}
