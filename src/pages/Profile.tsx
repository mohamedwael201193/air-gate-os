import { getUserProfile } from "@/air/airkit";
import { CredentialCard } from "@/components/CredentialCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { credentialService } from "@/services/credentialService";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Plus,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user, getService } = useAirKit();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);
  const [selectedCredType, setSelectedCredType] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    console.log("🔍 Profile: Current user from store:", user);
    console.log("🔍 Profile: User type:", typeof user);
    console.log("🔍 Profile: User keys:", user ? Object.keys(user) : "No user");

    if (!user) {
      console.log("🔍 Profile: No user found, redirecting to auth");
      navigate("/auth");
      return;
    }

    // Get user profile with real data
    let profile = getUserProfile();

    // If profile is null or shows default, try to build from user object
    if (!profile || profile.name === "AIR User") {
      console.log("🔄 Profile: Building from user object as fallback");
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

      const customAuth = user?.linkedAccounts?.find(
        (acc: any) => acc.type === "custom_auth"
      );

      profile = {
        name: displayName || "AIR User",
        email: email || "Not provided",
        did: user?.id || user?.did || "Not available",
        account:
          walletAccount?.address ||
          user?.wallet?.address ||
          user?.abstractAccountAddress ||
          "Not connected",
        customUserId: customAuth?.customUserId,
        linkedAccounts: user?.linkedAccounts || [],
        raw: user,
      };
    }

    console.log("📋 User Profile:", profile);
    setUserProfile(profile);

    // Load data
    setCredentials(credentialService.getCredentials());
    setVerifications(credentialService.getVerificationHistory());
  }, [user, navigate]);

  const handleIssueCredential = async () => {
    if (!selectedCredType) {
      toast.error("Please select a credential type");
      return;
    }

    setIsIssuing(true);
    try {
      const credData = {
        isVerified: true,
        issuedTo: user?.id || user?.did,
        timestamp: Date.now(),
      };

      await credentialService.issueCredential(
        null, // service not needed anymore
        selectedCredType as any,
        credData
      );

      setCredentials(credentialService.getCredentials());
      toast.success("Credential issued successfully!");
      setSelectedCredType("");
    } catch (error: any) {
      toast.error(error.message || "Failed to issue credential");
    } finally {
      setIsIssuing(false);
    }
  };

  if (!user) return null;

  const explorerBase =
    import.meta.env.VITE_EXPLORER_BASE_URL ||
    "https://devnet-scan.mocachain.tech";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">My Profile</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your AIR identity and credentials
          </p>
        </motion.div>

        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10 p-6 mb-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-cosmic flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-2xl font-bold">
                    {userProfile?.name || "AIR User"}
                    {userProfile?.name === "AIR User" &&
                      userProfile?.email &&
                      userProfile.email !== "Not provided" && (
                        <span className="text-muted-foreground text-lg ml-2">
                          ({userProfile.email})
                        </span>
                      )}
                  </h2>
                  {userProfile?.name !== "AIR User" &&
                    userProfile?.email &&
                    userProfile.email !== "Not provided" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {userProfile.email}
                      </Badge>
                    )}
                  {user.isMFASetup && (
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      MFA Enabled
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {userProfile?.email &&
                    userProfile.email !== "Not provided" && (
                      <InfoRow
                        label="Email"
                        value={userProfile.email}
                        copyable
                      />
                    )}
                  <InfoRow
                    label="DID"
                    value={userProfile?.did || "Not available"}
                    copyable
                  />
                  {userProfile?.account &&
                    userProfile.account !== "Not connected" && (
                      <InfoRow
                        label="Wallet"
                        value={userProfile.account}
                        copyable
                      />
                    )}
                  {userProfile?.customUserId && (
                    <InfoRow
                      label="Custom User ID"
                      value={userProfile.customUserId}
                      copyable
                    />
                  )}
                </div>
                {!user.isMFASetup && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">
                        MFA Setup Required
                      </p>
                      <p className="text-xs text-amber-500/80 mt-1">
                        Enable multi-factor authentication for enhanced security
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Credentials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              My Credentials
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-cosmic hover:shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/10">
                <DialogHeader>
                  <DialogTitle>Issue New Credential</DialogTitle>
                  <DialogDescription>
                    Select the type of credential you want to issue
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select
                    value={selectedCredType}
                    onValueChange={setSelectedCredType}
                  >
                    <SelectTrigger className="glass border-white/10">
                      <SelectValue placeholder="Select credential type" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10">
                      <SelectItem value="KYC_BASIC">
                        KYC Basic Verification
                      </SelectItem>
                      <SelectItem value="WORK_HISTORY">Work History</SelectItem>
                      <SelectItem value="FAN_BADGE">Fan Badge</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleIssueCredential}
                    disabled={isIssuing || !selectedCredType}
                    className="w-full bg-gradient-cosmic"
                  >
                    {isIssuing ? "Issuing..." : "Issue Credential"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {credentials.length === 0 ? (
            <Card className="glass border-white/10 p-12 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No credentials issued yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Issue Credential" to get started
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  onView={() => toast.info("Credential details coming soon")}
                  onShare={() =>
                    toast.info("Sharing functionality coming soon")
                  }
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Verification History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">Verification History</h2>
          <Card className="glass border-white/10 overflow-hidden">
            {verifications.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No verifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Visit the Demos page to try verification flows
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left">
                      <th className="p-4 text-muted-foreground font-medium">
                        Date
                      </th>
                      <th className="p-4 text-muted-foreground font-medium">
                        Type
                      </th>
                      <th className="p-4 text-muted-foreground font-medium">
                        Status
                      </th>
                      <th className="p-4 text-muted-foreground font-medium">
                        Proof ID
                      </th>
                      <th className="p-4 text-muted-foreground font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4 text-sm">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm">{record.type}</td>
                        <td className="p-4">
                          <Badge
                            className={
                              record.status === "success"
                                ? "bg-accent text-accent-foreground"
                                : "bg-destructive text-destructive-foreground"
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm font-mono">
                          {record.txHash || record.proofId}
                        </td>
                        <td className="p-4">
                          {record.txHash && (
                            <a
                              href={`${explorerBase}/tx/${record.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              View on Explorer
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-mono text-xs">{value}</span>
      {copyable && (
        <button
          onClick={handleCopy}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          📋
        </button>
      )}
    </div>
  );
}
