import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trustService } from "@/services/trustService";
import { useAirKit } from "@/store/useAirKit";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Users,
  Vote,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "passed" | "rejected";
  votesFor: number;
  votesAgainst: number;
  endTime: Date;
  requiredScore: number;
}

export default function DAOVoting() {
  const navigate = useNavigate();
  const { user } = useAirKit();
  const [trustScore, setTrustScore] = useState<number>(0);
  const [votingPower, setVotingPower] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const proposals: Proposal[] = [
    {
      id: 1,
      title: "Increase Trust Score for Work History",
      description:
        "Proposal to increase the trust score bonus for verified work history credentials from 25 to 35 points to better incentivize professional verification.",
      proposer: "0x742d...4a2c",
      status: "active",
      votesFor: 245,
      votesAgainst: 89,
      endTime: new Date(Date.now() + 86400000 * 2), // 2 days
      requiredScore: 0,
    },
    {
      id: 2,
      title: "Add GitHub Verification as Credential Type",
      description:
        "Introduce GitHub account verification as a new credential type worth 20 trust score points. This would enable developer community participation.",
      proposer: "0x8b3f...9d1e",
      status: "active",
      votesFor: 512,
      votesAgainst: 143,
      endTime: new Date(Date.now() + 86400000 * 5), // 5 days
      requiredScore: 0,
    },
    {
      id: 3,
      title: "Implement Collateral Rate Governance",
      description:
        "Allow DAO to vote on adjusting DeFi collateral rates based on market conditions. This proposal grants governance control over the risk parameters.",
      proposer: "0x1a7c...6f8b",
      status: "active",
      votesFor: 892,
      votesAgainst: 201,
      endTime: new Date(Date.now() + 86400000 * 7), // 7 days
      requiredScore: 50,
    },
  ];

  useEffect(() => {
    const loadTrustData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const address = user.abstractAccountAddress || user.wallet?.address;
        if (!address) {
          setIsLoading(false);
          return;
        }

        const profile = await trustService.getTrustProfile(address);
        if (profile) {
          setTrustScore(profile.trustScore);
          // Voting power = trust score (max 100, min 1)
          setVotingPower(Math.max(1, Math.min(100, profile.trustScore)));
        }
      } catch (error) {
        console.error("Failed to load trust profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrustData();

    // Load voting history from localStorage
    const votingHistory = localStorage.getItem("dao_voting_history");
    if (votingHistory) {
      setHasVoted(JSON.parse(votingHistory));
    }
  }, [user]);

  const handleVote = (proposalId: number, support: boolean) => {
    if (!user) {
      toast.error("Please login to vote");
      navigate("/auth");
      return;
    }

    if (votingPower === 0) {
      toast.error("You need credentials to vote. Get verified first!");
      navigate("/profile");
      return;
    }

    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal && trustScore < proposal.requiredScore) {
      toast.error(
        `This proposal requires a trust score of at least ${proposal.requiredScore}`
      );
      return;
    }

    if (hasVoted[proposalId]) {
      toast.error("You have already voted on this proposal");
      return;
    }

    // Record vote
    const newVotingHistory = { ...hasVoted, [proposalId]: true };
    setHasVoted(newVotingHistory);
    localStorage.setItem(
      "dao_voting_history",
      JSON.stringify(newVotingHistory)
    );

    toast.success(
      `Vote recorded! Your voting power: ${votingPower} (based on trust score: ${trustScore})`
    );
  };

  const getTimeRemaining = (endTime: Date) => {
    const diff = endTime.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const getVotePercentage = (proposal: Proposal) => {
    const total = proposal.votesFor + proposal.votesAgainst;
    return total > 0 ? Math.round((proposal.votesFor / total) * 100) : 0;
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cosmic mb-6">
            <Vote className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">DAO Governance</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vote on proposals with power proportional to your trust score.
            Higher credentials = stronger voice in governance decisions.
          </p>
        </motion.div>

        {/* Voting Power Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass border-white/10 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Your Voting Power
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user
                    ? "Based on your trust score and credentials"
                    : "Login to see your voting power"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text mb-1">
                  {isLoading ? "..." : votingPower}
                </div>
                <div className="text-sm text-muted-foreground">
                  Voting Power
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Trust Score: {trustScore}
                </div>
              </div>
            </div>
            {!user && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-gradient-cosmic hover:shadow-glow"
                >
                  Connect to Vote
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Proposals */}
        <div className="space-y-6">
          {proposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass border-white/10 p-6 hover:shadow-glow transition-all">
                {/* Proposal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">
                        {proposal.title}
                      </h3>
                      {proposal.requiredScore > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Requires {proposal.requiredScore}+ Trust Score
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Proposed by {proposal.proposer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(proposal.endTime)} remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voting Results */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Current Results
                    </span>
                    <span className="font-semibold">
                      {getVotePercentage(proposal)}% For
                    </span>
                  </div>
                  <Progress
                    value={getVotePercentage(proposal)}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-green-400" />
                      For: {proposal.votesFor}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3 text-red-400" />
                      Against: {proposal.votesAgainst}
                    </span>
                  </div>
                </div>

                {/* Voting Buttons */}
                <div className="flex gap-3">
                  {hasVoted[proposal.id] ? (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">
                        You Voted (Power: {votingPower})
                      </span>
                    </div>
                  ) : trustScore < proposal.requiredScore ? (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <XCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">
                        Requires {proposal.requiredScore}+ Trust Score
                      </span>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleVote(proposal.id, true)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-glow"
                        disabled={!user || votingPower === 0}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, false)}
                        variant="outline"
                        className="flex-1 border-red-500/30 hover:bg-red-500/10"
                        disabled={!user || votingPower === 0}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Vote Against
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="glass border-blue-500/30 bg-blue-500/10 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              How Trust-Weighted Voting Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-300 mb-2">
                  1. Build Trust Score
                </div>
                <p className="text-muted-foreground">
                  Get verified credentials (KYC, Work History, etc.) to build
                  your trust score up to 100 points.
                </p>
              </div>
              <div>
                <div className="font-medium text-blue-300 mb-2">
                  2. Voting Power = Trust Score
                </div>
                <p className="text-muted-foreground">
                  Your voting power directly equals your trust score. Higher
                  score = stronger vote.
                </p>
              </div>
              <div>
                <div className="font-medium text-blue-300 mb-2">
                  3. Sybil Resistance
                </div>
                <p className="text-muted-foreground">
                  Credential requirements prevent fake accounts from influencing
                  governance decisions.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
