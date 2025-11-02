import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trustService, type TrustProfile } from "@/services/trustService";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Shield,
  Star,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VerifyPublic() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [trustProfile, setTrustProfile] = useState<TrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!address) {
        setError("No address provided");
        setLoading(false);
        return;
      }

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setError("Invalid Ethereum address format");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await trustService.getTrustProfile(address);
        setTrustProfile(profile);
        setError("");
      } catch (err: any) {
        console.error("Failed to load trust profile:", err);
        setError("No trust profile found for this address");
        setTrustProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [address]);

  const getTrustLevel = (score: number): { label: string; color: string } => {
    if (score >= 200) return { label: "Exceptional", color: "text-purple-400" };
    if (score >= 150) return { label: "Excellent", color: "text-blue-400" };
    if (score >= 100) return { label: "Very Good", color: "text-green-400" };
    if (score >= 50) return { label: "Good", color: "text-yellow-400" };
    if (score >= 30) return { label: "Fair", color: "text-orange-400" };
    return { label: "Limited", color: "text-red-400" };
  };

  const explorerUrl = `${
    import.meta.env.VITE_EXPLORER_BASE_URL ||
    "https://devnet-scan.mocachain.tech"
  }/address/${address}`;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Public Trust Verification</span>
          </h1>
          <p className="text-muted-foreground">
            On-chain verifiable credential profile
          </p>
        </motion.div>

        {/* Address Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground mb-1">
                  Verified Address
                </div>
                <div className="font-mono text-sm break-all">{address}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(explorerUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorer
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">
              Loading trust profile from blockchain...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-red-500/20 p-8 text-center bg-red-500/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Profile Found</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                This address has not earned any verifiable credentials yet.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Success State - Trust Profile */}
        {!loading && !error && trustProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Trust Score Card */}
            <Card className="glass border-white/10 p-8 bg-gradient-to-br from-green-500/10 to-blue-500/10">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-cosmic flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-3xl font-bold">
                      {getTrustLevel(trustProfile.trustScore).label}
                    </h2>
                    <Badge className="bg-gradient-cosmic text-white">
                      <Star className="h-4 w-4 mr-1" />
                      {trustProfile.trustScore} Trust Score
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    This address has been verified on the Moca blockchain with{" "}
                    <span className="font-semibold text-foreground">
                      {trustProfile.proofTypes.length} verifiable credential
                      {trustProfile.proofTypes.length !== 1 ? "s" : ""}
                    </span>
                    .
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-sm text-muted-foreground mb-1">
                        Trust Score
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          getTrustLevel(trustProfile.trustScore).color
                        }`}
                      >
                        {trustProfile.trustScore}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-sm text-muted-foreground mb-1">
                        Verified Proofs
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {trustProfile.proofTypes.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-sm text-muted-foreground mb-1">
                        Endorsements
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {trustProfile.endorsementCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Verified Credentials */}
            {trustProfile.proofTypes.length > 0 && (
              <Card className="glass border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Verified Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trustProfile.proofTypes.map((proofType) => (
                    <div
                      key={proofType}
                      className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{proofType}</div>
                          <div className="text-sm text-muted-foreground">
                            Verified on-chain
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card className="glass border-white/10 p-6">
              <h3 className="text-lg font-bold mb-4">Verification Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Last Activity</span>
                  <span className="font-medium">
                    {trustProfile.lastActivityTimestamp > 0
                      ? new Date(
                          trustProfile.lastActivityTimestamp * 1000
                        ).toLocaleString()
                      : "No activity yet"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Blockchain</span>
                  <span className="font-medium">Moca Network Devnet</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    Verification Type
                  </span>
                  <span className="font-medium">On-Chain Immutable</span>
                </div>
              </div>
            </Card>

            {/* Call to Action */}
            <div className="text-center pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Want to build your own trust profile?
              </p>
              <Button
                className="bg-gradient-cosmic hover:shadow-glow"
                onClick={() => navigate("/auth")}
              >
                Get Started with AirGate OS
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
