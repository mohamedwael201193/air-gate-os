import { airLogin, getAirService } from '@/air/airkit';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAirKit } from '@/store/useAirKit';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { user, setUser } = useAirKit();
  const [step, setStep] = useState<'idle' | 'init' | 'login' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    if (user && (user as any).did) {
      navigate('/profile');
      return;
    }
    
    const storedUser = localStorage.getItem('airUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && (userData.did || userData.userDid)) {
          setUser(userData);
          navigate('/profile');
          return;
        }
      } catch (e) {
        // Invalid stored user data, continue with login flow
        localStorage.removeItem('airUser');
      }
    }
  }, [navigate, user, setUser]);

  const handleLogin = async () => {
    try {
      setStep('init');
      setError('');
      console.log('🟡 Initializing AIR service...');
      await getAirService();
      setStep('login');
      console.log('🟡 Calling airLogin...');
      const loginResult = await airLogin();
      console.log('🟢 Received user from airLogin:', loginResult);
      console.log('🟢 User type:', typeof loginResult);
      console.log('🟢 User keys:', Object.keys(loginResult || {}));
      console.log('🟢 Full user object:', JSON.stringify(loginResult, null, 2));
      
      // Store in both localStorage and Zustand store
      localStorage.setItem('airUser', JSON.stringify(loginResult || {}));
      setUser(loginResult);
      console.log('🟢 Stored user in localStorage and store');
      
      setStep('done');
      toast.success('Login successful! Redirecting...');
      setTimeout(() => {
        console.log('🟢 Navigating to profile...');
        navigate('/profile');
      }, 1000);
    } catch (e: any) {
      console.error('🔴 Login error:', e);
      setError(e?.message || 'Login failed');
      setStep('error');
      toast.error(e?.message || 'Login failed');
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
              {step !== 'idle' && (
                <StatusItem
                  label="Initializing AIR Kit"
                  status={step === 'init' ? 'loading' : step === 'error' ? 'error' : 'success'}
                />
              )}
              {(step === 'login' || step === 'done') && (
                <StatusItem
                  label={step === 'login' ? 'Authenticating...' : 'Authentication complete'}
                  status={step === 'login' ? 'loading' : 'success'}
                />
              )}
            </div>

            {/* Manual Login Button */}
            {step === 'idle' && (
              <Button
                onClick={handleLogin}
                className="w-full btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg py-6"
              >
                <Shield className="h-5 w-5 mr-2" />
                Connect with AIR
              </Button>
            )}

            {/* Retry Button */}
            {step === 'error' && (
              <Button
                onClick={handleLogin}
                className="w-full btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg py-6"
              >
                <Shield className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            )}

            {/* Loading states */}
            {(step === 'init' || step === 'login') && (
              <Button
                disabled
                className="w-full btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg py-6"
              >
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {step === 'init' ? 'Initializing...' : 'Authenticating...'}
              </Button>
            )}

            {/* Success state */}
            {step === 'done' && (
              <Button
                disabled
                className="w-full btn-glow bg-gradient-cosmic hover:shadow-glow-lg text-lg py-6"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Redirecting...
              </Button>
            )}

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
