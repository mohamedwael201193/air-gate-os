import { airVerify } from "@/air/airkit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function VerifyCredential() {
  const navigate = useNavigate();
  const { user } = useAirKit();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    credentialType: string;
    message: string;
    details?: any;
  } | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demos = [
    {
      id: "premium-access",
      title: "Premium Feature Access",
      description: "Verify KYC credential to unlock premium features",
      requiredCredential: "KYC_BASIC",
      icon: Lock,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "vip-lounge",
      title: "VIP Community Access",
      description: "Verify Fan Badge credential for exclusive community",
      requiredCredential: "FAN_BADGE",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "professional-network",
      title: "Professional Network",
      description: "Verify Work History credential for professional features",
      requiredCredential: "WORK_HISTORY",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const handleVerify = async (demoId: string, requiredCredential: string) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/auth");
      return;
    }

    setSelectedDemo(demoId);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      console.log("🔍 Verifying credential:", requiredCredential);

      // Get the verifier program ID for this credential type
      const verifierProgramIds = JSON.parse(
        import.meta.env.VITE_VERIFIER_PROGRAM_IDS || "{}"
      );

      // Map credential types to verifier programs
      const verifierMap: Record<string, string> = {
        KYC_BASIC: verifierProgramIds.DEFI_JOB_GATE_KYC,
        WORK_HISTORY: verifierProgramIds.DEFI_JOB_GATE_WORK,
        FAN_BADGE: verifierProgramIds.FAN_VIP_GATE,
      };

      const verifierProgramId = verifierMap[requiredCredential];

      if (!verifierProgramId) {
        throw new Error(`No verifier program found for ${requiredCredential}`);
      }

      console.log("🔍 Using verifier program:", verifierProgramId);

      // Request verification from AIR - this opens AIR wallet to verify credential
      // This VERIFIES existing credential, not issues a new one
      const verifyResult = await airVerify(
        verifierProgramId,
        `${window.location.origin}/verify-credential`
      );

      console.log("📥 Verification result:", verifyResult);

      // AIR Kit returns the verified credential if it exists
      if (verifyResult) {
        // Credential exists and is valid!
        setVerificationResult({
          success: true,
          credentialType: requiredCredential,
          message: `Access granted! Your ${requiredCredential} credential is verified.`,
          details: verifyResult,
        });

        toast.success("Verification successful!");
      } else {
        // Credential not found or verification failed
        setVerificationResult({
          success: false,
          credentialType: requiredCredential,
          message: `Access denied. You don't have a valid ${requiredCredential} credential.`,
        });

        toast.error("Credential not found");
      }
    } catch (error: any) {
      console.error("❌ Verification failed:", error);

      // Check if error is because credential doesn't exist
      if (
        error.message?.includes("not found") ||
        error.message?.includes("No credential")
      ) {
        setVerificationResult({
          success: false,
          credentialType: requiredCredential,
          message: `Access denied. You don't have a valid ${requiredCredential} credential.`,
        });
        toast.error("Credential not found. Please issue one first.");
      } else {
        toast.error(`Verification error: ${error.message}`);
        setVerificationResult({
          success: false,
          credentialType: requiredCredential,
          message: `Verification failed: ${error.message}`,
        });
      }
    } finally {
      setIsVerifying(false);
    }
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
            <span className="gradient-text">Credential Verification</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            This demo shows credential VERIFICATION (not issuance). The system
            checks if you already have valid credentials.
          </p>

          <Card className="glass border-amber-500/30 bg-amber-500/10 p-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-left text-sm">
                <p className="font-medium text-amber-500 mb-1">
                  Key Difference from Issuance:
                </p>
                <p className="text-amber-500/80">
                  • <strong>Issuance:</strong> Creates new credentials (like
                  getting a passport)
                  <br />• <strong>Verification:</strong> Checks existing
                  credentials (like showing your passport at airport)
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {demos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-white/10 p-6 h-full">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4`}
                >
                  <demo.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2">{demo.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {demo.description}
                </p>

                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-1">
                    Required Credential:
                  </p>
                  <p className="text-sm font-mono text-blue-400">
                    {demo.requiredCredential}
                  </p>
                </div>

                <Button
                  onClick={() => handleVerify(demo.id, demo.requiredCredential)}
                  disabled={isVerifying && selectedDemo === demo.id}
                  className="w-full bg-gradient-cosmic hover:shadow-glow"
                >
                  {isVerifying && selectedDemo === demo.id
                    ? "Verifying..."
                    : "Verify Access"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card
              className={`glass p-6 border-2 ${
                verificationResult.success
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-red-500/50 bg-red-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    verificationResult.success
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {verificationResult.success ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      verificationResult.success
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {verificationResult.success
                      ? "✅ Verification Successful"
                      : "❌ Verification Failed"}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {verificationResult.message}
                  </p>

                  {verificationResult.success && verificationResult.details && (
                    <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Credential ID:
                        </span>
                        <p className="text-sm font-mono">
                          {verificationResult.details.credentialId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Issued At:
                        </span>
                        <p className="text-sm">
                          {new Date(
                            verificationResult.details.issuedAt
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Issuer:
                        </span>
                        <p className="text-sm font-mono break-all">
                          {verificationResult.details.issuer}
                        </p>
                      </div>
                    </div>
                  )}

                  {!verificationResult.success && (
                    <div className="mt-4">
                      <Button
                        onClick={() => navigate("/demos")}
                        variant="outline"
                        className="border-blue-500/50 hover:bg-blue-500/10"
                      >
                        Issue Credential First →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="glass border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">
              🔍 How Verification Works
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-sm font-medium mb-1">Request Access</p>
                <p className="text-xs text-muted-foreground">
                  User tries to access protected feature
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-sm font-medium mb-1">Check Credentials</p>
                <p className="text-xs text-muted-foreground">
                  System queries AIR for existing credentials
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-sm font-medium mb-1">Verify Validity</p>
                <p className="text-xs text-muted-foreground">
                  Check credential signatures and expiry
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">4️⃣</div>
                <p className="text-sm font-medium mb-1">Grant/Deny</p>
                <p className="text-xs text-muted-foreground">
                  Allow access based on verification result
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
