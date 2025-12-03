import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import App from "./App.jsx";
import "./index.css";
import { RPC_ENDPOINT } from "./solanaConfig";

import "@solana/wallet-adapter-react-ui/styles.css";

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);
