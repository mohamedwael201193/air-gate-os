import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAirKit } from '@/store/useAirKit';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';

export default function Auth() {
  const navigate = useNavigate();
  const { init, login, isReady, isLoading, user, error } = useAirKit();
  const [initStatus, setInitStatus] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      navigate('/profile');
      return;
    }

    const initializeService = async () => {
      setInitStatus('initializing');
      try {
        await init();
        setInitStatus('ready');
        toast.success('AIR Kit initialized successfully');
      } catch (err) {
        setInitStatus('error');
        toast.error('Failed to initialize AIR Kit');
      }
    };

    if (!isReady && initStatus === 'idle') {
      initializeService();
    }
  }, [user, navigate, init, isReady, initStatus]);

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <ParticleBackground />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="glass border-white/10 p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cosmic mb-4 animate-glow">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="gradient-text">Connect Your AIR Identity</span>
              </h1>
              <p className="text-muted-foreground">
                Secure, privacy-preserving authentication powered by Moca Network
              </p>
            </div>

            {/* Initialization Status */}
            <div className="mb-6 space-y-3">
              <StatusItem
                label="Initializing AIR Kit"
                status={initStatus === 'initializing' ? 'loading' : initStatus === 'ready' ? 'success' : initStatus === 'error' ? 'error' : 'idle'}
              />
              {initStatus === 'ready' && (
                <StatusItem
                  label="Ready for authentication"
                  status="success"
                />
              )}
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!isReady || isLoading}
              className="w-full btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Connect with AIR
                </>
              )}
            </Button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 space-y-3">
              <Feature text="Zero-knowledge proof authentication" />
              <Feature text="Self-sovereign identity control" />
              <Feature text="Multi-factor authentication support" />
              <Feature text="Cross-platform compatibility" />
            </div>
          </Card>

          {/* Info Section */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By connecting, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'idle' | 'loading' | 'success' | 'error' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
      {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      {status === 'success' && <CheckCircle2 className="h-4 w-4 text-accent" />}
      {status === 'error' && <span className="text-destructive">✕</span>}
      {status === 'idle' && <div className="h-4 w-4 rounded-full border-2 border-muted" />}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
