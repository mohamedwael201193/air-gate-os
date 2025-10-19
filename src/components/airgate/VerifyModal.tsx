import { airIssue, airLogin, airVerify, getSubjectId } from "@/air/airkit";
import { getIssuerId, getVerifierId } from "@/air/programs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoKey: "defiJob" | "fanVip" | "traderTier";
  title: string;
  description: string;
}

export function VerifyModal({
  isOpen,
  onClose,
  demoKey,
  title,
  description,
}: VerifyModalProps) {
  const [step, setStep] = useState<
    "idle" | "login" | "issuing" | "verifying" | "success" | "error"
  >("idle");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const runFlow = async () => {
    try {
      setStep("login");
      setError("");

      // Ensure user is logged in
      await airLogin();

      if (demoKey === "defiJob") {
        setStep("issuing");
        // Issue KYC and Work History credentials
        await airIssue(getIssuerId("KYC_BASIC"), {
          isVerified: true,
          jurisdiction: "GB",
          level: "BASIC",
          id: getSubjectId(),
        });

        await airIssue(getIssuerId("WORK_HISTORY"), {
          employer: "Demo Ltd",
          role: "Engineer",
          yearsExperience: 3,
          id: getSubjectId(),
        });

        setStep("verifying");
        // Verify both gates
        const k = await airVerify(
          getVerifierId("DEFI_JOB_GATE_KYC"),
          location.origin + "/profile"
        );
        const w = await airVerify(
          getVerifierId("DEFI_JOB_GATE_WORK"),
          location.origin + "/profile"
        );
        setResults({ kyc: k, work: w });
      }

      if (demoKey === "fanVip") {
        setStep("issuing");
        await airIssue(getIssuerId("FAN_BADGE"), {
          eventName: "MocaFest",
          tier: "VIP",
          attended: true,
          id: getSubjectId(),
        });

        setStep("verifying");
        const result = await airVerify(
          getVerifierId("FAN_VIP_GATE"),
          location.origin + "/profile"
        );
        setResults(result);
      }

      if (demoKey === "traderTier") {
        setStep("issuing");
        await airIssue(getIssuerId("KYC_BASIC"), {
          isVerified: true,
          jurisdiction: "GB",
          level: "BASIC",
          id: getSubjectId(),
        });

        setStep("verifying");
        const result = await airVerify(
          getVerifierId("TRADER_TIER_GATE"),
          location.origin + "/profile"
        );
        setResults(result);
      }

      setStep("success");

      // Show success toast with results
      const status = results?.status ?? results?.result?.status ?? "verified";
      const tx = results?.txHash ?? results?.result?.txHash;
      toast.success(
        `Verification: ${status}${tx ? ` • ${tx.slice(0, 10)}…` : ""}`
      );
    } catch (e: any) {
      console.error("Verification flow failed:", e);
      setError(e?.message || "Verification failed");
      setStep("error");
      toast.error(e?.message || "Verification failed");
    }
  };

  const handleClose = () => {
    setStep("idle");
    setResults(null);
    setError("");
    onClose();
  };

  const getStepMessage = () => {
    switch (step) {
      case "login":
        return "Authenticating with AIR...";
      case "issuing":
        return "Issuing required credentials...";
      case "verifying":
        return "Running verification...";
      case "success":
        return "Verification completed successfully!";
      case "error":
        return "Verification failed";
      default:
        return "Ready to start verification";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="p-4 rounded-lg bg-black/20 border border-white/10">
            <div className="flex items-center gap-3">
              {step === "idle" && (
                <div className="w-4 h-4 rounded-full border-2 border-primary" />
              )}
              {(step === "login" ||
                step === "issuing" ||
                step === "verifying") && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              {step === "success" && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {step === "error" && <span className="text-red-500">✕</span>}
              <span className="text-sm">{getStepMessage()}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && step === "success" && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-green-400 mb-2">
                Verification Results:
              </h4>
              <div className="space-y-1 text-sm">
                {typeof results === "object" && results.kyc && results.work ? (
                  <>
                    <p>KYC Gate: {results.kyc?.status || "verified"}</p>
                    <p>Work Gate: {results.work?.status || "verified"}</p>
                    {(results.kyc?.txHash || results.work?.txHash) && (
                      <p className="font-mono text-xs text-green-300">
                        TX:{" "}
                        {(results.kyc?.txHash || results.work?.txHash)?.slice(
                          0,
                          16
                        )}
                        ...
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Status: {results?.status || "verified"}</p>
                    {results?.txHash && (
                      <p className="font-mono text-xs text-green-300">
                        TX: {results.txHash.slice(0, 16)}...
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {step === "idle" && (
              <Button
                onClick={runFlow}
                className="flex-1 bg-gradient-cosmic hover:shadow-glow"
              >
                Start Verification
              </Button>
            )}

            {(step === "success" || step === "error") && (
              <Button onClick={runFlow} variant="outline" className="flex-1">
                Try Again
              </Button>
            )}

            <Button
              onClick={handleClose}
              variant="ghost"
              className="flex-1"
              disabled={
                step === "login" || step === "issuing" || step === "verifying"
              }
            >
              {step === "success" ? "Done" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
