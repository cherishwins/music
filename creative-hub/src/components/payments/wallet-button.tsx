"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  if (isConnecting) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 rounded-lg bg-tiger/20 border border-tiger/30 text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        className="gap-2 bg-tiger hover:bg-tiger-muted"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>

      {showConnectors && (
        <div className="absolute top-full mt-2 right-0 w-64 p-2 rounded-xl bg-crucible border border-white/10 shadow-xl z-50">
          <div className="text-xs text-white/50 px-2 py-1 mb-1">
            Choose wallet
          </div>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setShowConnectors(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              {connector.name === "Coinbase Wallet" && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                  C
                </div>
              )}
              {connector.name === "MetaMask" && (
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">
                  🦊
                </div>
              )}
              {connector.name === "WalletConnect" && (
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                  W
                </div>
              )}
              {!["Coinbase Wallet", "MetaMask", "WalletConnect"].includes(connector.name) && (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  <Wallet className="h-3 w-3" />
                </div>
              )}
              <span>{connector.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
