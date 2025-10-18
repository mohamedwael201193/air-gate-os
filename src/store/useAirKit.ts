import { create } from 'zustand';

interface AirKitUser {
  did: string;
  email?: string;
  abstractAccountAddress?: string;
  isMFASetup?: boolean;
  [key: string]: any;
}

interface AirKitStore {
  service: any | null;
  user: AirKitUser | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  
  init: () => Promise<void>;
  login: () => Promise<any>;
  logout: () => void;
  setUser: (user: AirKitUser | null) => void;
  setError: (error: string | null) => void;
}

export const useAirKit = create<AirKitStore>((set, get) => ({
  service: null,
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  init: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Dynamic import to avoid build issues
          const { AirService, BUILD_ENV } = await import('@mocanetwork/airkit');
          
          const service = new AirService({
            partnerId: import.meta.env.VITE_AIR_PARTNER_ID || '0b2c97d1-2c97-43cc-adce-617e6ab3327f'
          });

          await service.init({
            buildEnv: BUILD_ENV.DEVELOPMENT,
            enableLogging: true,
            skipRehydration: false
          });

          set({ service, isReady: true, isLoading: false });
          console.log('✅ AIR Kit initialized successfully');
        } catch (error: any) {
          console.error('❌ AIR Kit initialization failed:', error);
          set({ error: error.message, isLoading: false });
          
          // Fallback mock for development
          set({ 
            service: { mock: true }, 
            isReady: true, 
            isLoading: false 
          });
        }
      },

      login: async () => {
        try {
          const { service } = get();
          if (!service) throw new Error('Service not initialized');

          set({ isLoading: true, error: null });

          if (service.mock) {
            // Mock login for development
            const mockUser = {
              did: 'did:air:id:test:mock123',
              email: 'demo@airgateos.com',
              abstractAccountAddress: '0x1234...5678',
              isMFASetup: true
            };
            set({ user: mockUser, isLoading: false });
            localStorage.setItem('airUser', JSON.stringify(mockUser));
            return mockUser;
          }

          const result = await service.login();
          set({ user: result, isLoading: false });
          localStorage.setItem('airUser', JSON.stringify(result));
          
          console.log('✅ Login successful:', result);
          return result;
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, error: null });
        localStorage.removeItem('airUser');
        console.log('✅ Logged out successfully');
      },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
}));
