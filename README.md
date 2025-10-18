# AirGate OS

**Drop-in Eligibility Powered by Zero-Knowledge Proofs**

A production-ready Web3 identity verification platform built for the Moca Network Proof of Build hackathon. AirGate OS leverages the AIR Kit SDK to provide privacy-preserving credential issuance and verification flows.

## 🌟 Project Overview

AirGate OS transforms identity verification by combining zero-knowledge proofs with user-controlled credentials. Users can prove claims about themselves without revealing underlying data, while verifiers get cryptographic guarantees of validity.

**Live Demo**: https://airgate-os.vercel.app

## 🎯 Key Features

### 1. Real AIR Kit Integration
- Authentic AIR SSO authentication
- Production-ready credential issuance
- Zero-knowledge proof verification
- On-chain anchoring via Moca Network

### 2. Innovation Showcase
- **Visual Rule Composer**: Drag-and-drop interface for creating verification rules
- **Privacy Dashboard**: Interactive visualization of zero-knowledge proofs
- **ROI Calculator**: Shows 99% cost reduction vs traditional KYC

### 3. Live Demos
- DeFi Job Verification
- Fan VIP Access
- Trader Tier Verification

### 4. Complete User Experience
- Beautiful cosmic-themed UI with glassmorphism
- Particle effects and smooth animations
- Persistent credential storage
- Comprehensive verification history

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion
- **Identity**: @mocanetwork/airkit
- **State**: Zustand for global state
- **Web3**: wagmi + viem for wallet connections
- **UI Components**: shadcn/ui

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx
│   ├── CredentialCard.tsx
│   └── ParticleBackground.tsx
├── pages/              # Application pages
│   ├── Home.tsx
│   ├── Auth.tsx
│   ├── Profile.tsx
│   ├── Demos.tsx
│   ├── Innovation.tsx
│   └── Docs.tsx
├── services/           # Business logic
│   └── credentialService.ts
├── store/              # Global state management
│   └── useAirKit.ts
└── types/              # TypeScript definitions
    └── env.d.ts
```

## 🎨 Design System

AirGate OS features a cosmic-themed design with:

- **Cosmic Purple** (#8B5CF6) - Primary brand color
- **Neon Pink** (#EC4899) - Secondary accents
- **Mint Green** (#10B981) - Success states
- **Deep Space** (#0A0118) - Background
- **Nebula Dark** (#1A0B2E) - Surface colors

All colors use HSL values for consistent theming and are defined in `src/index.css`.

## 🔧 Environment Variables

All required environment variables are pre-configured in `.env`:

- AIR Partner ID and DIDs
- Moca Network configuration (Chain ID: 5151)
- Program IDs for credentials and verifiers
- Partner token endpoint

## 📖 Usage Guide

### 1. Connect AIR Identity
Navigate to `/auth` and click "Connect with AIR" to authenticate using the AIR Kit SSO.

### 2. Issue Credentials
Visit your profile at `/profile` and click "Issue Credential" to create verifiable credentials like:
- KYC Basic Verification
- Work History
- Fan Badge

### 3. Run Verification Demos
Go to `/demos` to try real verification scenarios that show credential issuance and ZK proof generation.

### 4. Explore Innovation Features
Visit `/innovation` to experience:
- Visual rule composer
- Privacy score calculator
- ROI comparison tool

## 🏆 Hackathon Criteria

### Innovation & Novelty (25%)
- First visual rule composer for Web3 identity
- Privacy dashboard with ZK proof visualization
- Novel ROI calculator for cost comparison

### Technical Robustness (30%)
- Real AIR Kit SDK integration (not mocks)
- Proper error handling and loading states
- Persistent storage with localStorage
- Type-safe TypeScript throughout

### User Experience (20%)
- Intuitive navigation and flows
- Beautiful animations and transitions
- Clear feedback for all actions
- Responsive design for all devices

### Privacy & Trustlessness (15%)
- Zero-knowledge proofs for all verifications
- User-controlled credentials
- No central authority needed
- On-chain proof anchoring

### Potential Impact (10%)
- 99% cost reduction vs traditional KYC
- Applicable to DeFi, gaming, fan communities
- Scalable to millions of users
- Enterprise-ready features

## 🔗 Resources

- [Moca Network Docs](https://docs.moca.network)
- [AIR Kit GitHub](https://github.com/mocanetwork/airkit)
- [Block Explorer](https://devnet-scan.mocachain.tech)

## 📄 License

This project was created for the Moca Network Proof of Build hackathon.

## 👥 Team

Built with ❤️ by the AirGate OS team

**Contact**: hello@airgateos.com

