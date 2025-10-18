import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Share2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CredentialCardProps {
  credential: {
    id: string;
    type: string;
    issuedAt: number;
    status: 'active' | 'revoked' | 'expired';
    data?: any;
  };
  onView?: () => void;
  onShare?: () => void;
}

const credentialIcons: Record<string, string> = {
  KYC_BASIC: '🔐',
  WORK_HISTORY: '💼',
  FAN_BADGE: '⭐',
};

const credentialColors: Record<string, string> = {
  KYC_BASIC: 'from-purple-500/20 to-pink-500/20',
  WORK_HISTORY: 'from-blue-500/20 to-cyan-500/20',
  FAN_BADGE: 'from-amber-500/20 to-orange-500/20',
};

export function CredentialCard({ credential, onView, onShare }: CredentialCardProps) {
  const icon = credentialIcons[credential.type] || '📄';
  const colorClass = credentialColors[credential.type] || 'from-purple-500/20 to-pink-500/20';
  
  const statusColors = {
    active: 'bg-accent text-accent-foreground',
    revoked: 'bg-destructive text-destructive-foreground',
    expired: 'bg-muted text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`glass border-white/10 p-6 bg-gradient-to-br ${colorClass} hover:shadow-glow transition-all`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <h3 className="font-semibold text-foreground">
                {credential.type.replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(credential.issuedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={statusColors[credential.status]}>
            {credential.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {credential.status}
          </Badge>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-black/20">
          <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
          <p className="text-sm font-mono text-foreground truncate">{credential.id}</p>
        </div>

        <div className="flex gap-2">
          {onView && (
            <Button
              onClick={onView}
              variant="outline"
              size="sm"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              size="sm"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
