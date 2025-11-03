import { getUserProfile } from "@/air/airkit";
import { CredentialCard } from "@/components/CredentialCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { credentialService } from "@/services/credentialService";
import { trustService, type TrustProfile } from "@/services/trustService";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  Shield,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRY_CONTRACT_ADDRESS;

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAirKit();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [trustProfile, setTrustProfile] = useState<TrustProfile | null>(null);
  const [loadingTrust, setLoadingTrust] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Get user profile with real data from localStorage (set during login)
    let profile = getUserProfile();
    console.log("📋 Profile loaded from getUserProfile():", profile);

    // Only build from user object if getUserProfile returns null
    if (!profile) {
      console.log(
        "⚠️ No profile from getUserProfile, building from user object"
      );
      const emailAccount = user?.linkedAccounts?.find(
        (acc: any) => acc.type === "email"
      );
      const walletAccount = user?.linkedAccounts?.find(
        (acc: any) => acc.type === "wallet"
      );

      const email = user?.email || emailAccount?.address;
      let displayName = user?.name || user?.given_name;

      // Derive name from email if needed
      if (!displayName && email) {
        const localPart = email.split("@")[0];
        displayName = localPart
          .split(/[._-]/)
          .map(
            (part: string) =>
              part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join(" ");
      }

      profile = {
        name: displayName || email || "AIR User",
        email: email || "Not provided",
        did: user?.id || user?.did || "Not available",
        account:
          walletAccount?.address ||
          user?.wallet?.address ||
          user?.abstractAccountAddress ||
          "Not connected",
        customUserId: undefined,
        linkedAccounts: user?.linkedAccounts || [],
        raw: user,
      };
    }

    console.log("✅ Final profile to display:", profile);
    setUserProfile(profile);

    // Load trust profile from blockchain
    const loadTrustProfile = async () => {
      if (profile?.account && profile.account !== "Not connected") {
        try {
          setLoadingTrust(true);
          const trust = await trustService.getTrustProfile(profile.account);
          setTrustProfile(trust);
        } catch (error) {
          console.error("Failed to load trust profile:", error);
          setTrustProfile(null);
        } finally {
          setLoadingTrust(false);
        }
      } else {
        setLoadingTrust(false);
      }
    };

    loadTrustProfile();

    // Load data
    const creds = credentialService.getCredentials();
    const verifs = credentialService.getVerificationHistory();

    console.log("📜 Loaded credentials:", creds.length, creds);
    console.log("✅ Loaded verifications:", verifs.length, verifs);

    setCredentials(creds);
    setVerifications(verifs);
  }, [user, navigate]);

  const handleIssueCredential = async () => {
    navigate("/demos");
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!user) return null;

  const explorerBase =
    import.meta.env.VITE_EXPLORER_BASE_URL ||
    "https://devnet-scan.mocachain.tech";

  const getTrustTier = (score: number) => {
    if (score >= 80)
      return {
        name: "Gold",
        color: "text-yellow-400",
        gradient: "from-yellow-400 to-orange-400",
      };
    if (score >= 50)
      return {
        name: "Silver",
        color: "text-gray-300",
        gradient: "from-gray-300 to-gray-400",
      };
    return {
      name: "Bronze",
      color: "text-orange-600",
      gradient: "from-orange-600 to-orange-700",
    };
  };

  const tier = trustProfile ? getTrustTier(trustProfile.trustScore) : null;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-background via-background to-purple-950/20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">My Profile</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Your decentralized identity on the blockchain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="glass border-white/10 p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-xl">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-cosmic flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-purple-500/50">
                    {userProfile?.email && userProfile.email !== "Not provided"
                      ? userProfile.email[0].toUpperCase()
                      : "A"}
                  </div>
                  {tier && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <Badge
                        className={`bg-gradient-to-r ${tier.gradient} text-white border-0 shadow-lg`}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {tier.name}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* User Name/Email */}
                <h2 className="text-2xl font-bold text-center mb-2">
                  {userProfile?.name && userProfile.name !== "AIR User"
                    ? userProfile.name
                    : userProfile?.email && userProfile.email !== "Not provided"
                    ? userProfile.email
                        .split("@")[0]
                        .split(/[._-]/)
                        .map(
                          (part: string) =>
                            part.charAt(0).toUpperCase() +
                            part.slice(1).toLowerCase()
                        )
                        .join(" ")
                    : "AIR User"}
                </h2>

                {/* Show email or wallet address */}
                {userProfile?.email && userProfile.email !== "Not provided" ? (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{userProfile.email}</span>
                  </div>
                ) : userProfile?.account &&
                  userProfile.account !== "Not connected" ? (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Wallet className="h-4 w-4" />
                    <span className="text-xs font-mono">
                      {userProfile.account.slice(0, 6)}...
                      {userProfile.account.slice(-4)}
                    </span>
                  </div>
                ) : null}

                {/* Trust Score - Large Display */}
                {trustProfile && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full mt-6 p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10"
                  >
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                        <Star className="h-4 w-4" />
                        Trust Score
                      </div>
                      <div className={`text-6xl font-bold mb-2 ${tier?.color}`}>
                        {trustProfile.trustScore}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trustProfile.trustScore}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className={`h-full bg-gradient-to-r ${tier?.gradient}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold">{credentials.length}</div>
                  <div className="text-xs text-muted-foreground">
                    Credentials
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold">
                    {verifications.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Verifications
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleIssueCredential}
                className="w-full mt-6 bg-gradient-cosmic hover:shadow-glow"
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Credentials
              </Button>
            </Card>
          </motion.div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blockchain Identity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  Blockchain Identity
                </h3>
                <div className="space-y-4">
                  {userProfile?.account &&
                    userProfile.account !== "Not connected" && (
                      <InfoField
                        label="Wallet Address"
                        value={userProfile.account}
                        icon={<Wallet className="h-4 w-4" />}
                        copyable
                        onCopy={() => handleCopy(userProfile.account, "wallet")}
                        copied={copiedField === "wallet"}
                        link={`${explorerBase}/address/${userProfile.account}`}
                      />
                    )}
                  {userProfile?.did && userProfile.did !== "Not available" && (
                    <InfoField
                      label="Decentralized ID (DID)"
                      value={userProfile.did}
                      icon={<Shield className="h-4 w-4" />}
                      copyable
                      onCopy={() => handleCopy(userProfile.did, "did")}
                      copied={copiedField === "did"}
                    />
                  )}
                </div>
              </Card>
            </motion.div>

            {/* On-Chain Trust Profile */}
            {trustProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="glass border-white/10 p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    On-Chain Verification
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Verified
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Shield className="h-4 w-4" />
                        Verified Proofs
                      </div>
                      <div className="text-3xl font-bold text-green-400">
                        {trustProfile.proofTypes.length}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Award className="h-4 w-4" />
                        Endorsements
                      </div>
                      <div className="text-3xl font-bold text-purple-400">
                        {trustProfile.endorsementCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Clock className="h-4 w-4" />
                        Last Activity
                      </div>
                      <div className="text-sm font-medium text-blue-400">
                        {trustProfile.lastActivityTimestamp > 0
                          ? new Date(
                              trustProfile.lastActivityTimestamp * 1000
                            ).toLocaleDateString()
                          : "No activity"}
                      </div>
                    </div>
                  </div>
                  {trustProfile.proofTypes.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">
                        Registered Proof Types:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trustProfile.proofTypes.map((proofType) => (
                          <Badge
                            key={proofType}
                            variant="outline"
                            className="bg-blue-500/10 border-blue-500/30 text-blue-400"
                          >
                            {proofType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    My Credentials
                  </h3>
                </div>
                {credentials.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No credentials yet
                    </p>
                    <Button
                      onClick={() => navigate("/demos")}
                      variant="outline"
                      className="glass"
                    >
                      Create Your First Credential
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {credentials.map((cred) => (
                      <CredentialCard
                        key={cred.id}
                        credential={cred}
                        onView={() => toast.info("Credential details")}
                        onShare={() => toast.info("Share credential")}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Verification History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="glass border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Verification History
                </h3>
                {verifications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">
                      No verifications yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Visit the Demos page to try verification flows
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verifications.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                record.status === "success"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }
                            >
                              {record.status}
                            </Badge>
                            <span className="font-medium">{record.type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {record.txHash && (
                          <a
                            href={`${explorerBase}/tx/${record.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Explorer
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  copyable,
  onCopy,
  copied,
  link,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  link?: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs break-all flex-1">{value}</code>
        <div className="flex items-center gap-1 flex-shrink-0">
          {copyable && onCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          {link && (
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title="View on blockchain explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
