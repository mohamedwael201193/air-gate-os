import type { Chain } from "viem";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

export const mocaDevnet: Chain = {
  id: 5151,
  name: "Moca Devnet",
  nativeCurrency: { name: "MOCA", symbol: "MOCA", decimals: 18 },
  rpcUrls: { default: { http: ["https://devnet-rpc.mocachain.org"] } },
  blockExplorers: { default: { name: "Moca", url: "https://devnet-scan.mocachain.tech" } },
  testnet: true,
};

const siteUrl = typeof window !== "undefined" ? window.location.origin
  : (import.meta.env.VITE_APP_URL || "https://airgate-os.vercel.app");

export const wagmiConfig = createConfig({
  chains: [mocaDevnet],
  transports: { [mocaDevnet.id]: http() },
  connectors: [
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID!,
      metadata: {
        name: "AirGate OS",
        description: "Eligibility and credentials on Moca",
        url: siteUrl,
        icons: [`${siteUrl}/icon-512.png`],
      },
      showQrModal: true,
    }),
    coinbaseWallet({ appName: "AirGate OS" }),
  ],
});