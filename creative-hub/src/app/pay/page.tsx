"use client";

import { useState } from "react";
import { USDCPayment } from "@/components/payments";
import { WalletButton } from "@/components/payments";
import { PRODUCTS, type ProductId } from "@/lib/wallet-config";
import { ArrowLeft, Shield, Zap, Wallet } from "lucide-react";
import Link from "next/link";

export default function PayPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSuccess = (hash: string) => {
    setTxHash(hash);
    console.log("Payment successful! TX:", hash);
  };

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Header */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Pay with <span className="text-tiger">USDC</span>
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            Self-sovereign payments. No middlemen. Direct to our treasury.
          </p>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-crucible border border-white/10 text-center">
            <Shield className="h-6 w-6 text-tiger mx-auto mb-2" />
            <div className="text-sm font-medium">On-Chain</div>
            <div className="text-xs text-white/50">Verified on Base</div>
          </div>
          <div className="p-4 rounded-xl bg-crucible border border-white/10 text-center">
            <Zap className="h-6 w-6 text-tiger mx-auto mb-2" />
            <div className="text-sm font-medium">Instant</div>
            <div className="text-xs text-white/50">~2 sec confirmation</div>
          </div>
          <div className="p-4 rounded-xl bg-crucible border border-white/10 text-center">
            <Wallet className="h-6 w-6 text-tiger mx-auto mb-2" />
            <div className="text-sm font-medium">Your Keys</div>
            <div className="text-xs text-white/50">Self-custody</div>
          </div>
        </div>

        {/* Product selection or payment */}
        {!selectedProduct ? (
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {Object.entries(PRODUCTS).map(([id, product]) => (
              <button
                key={id}
                onClick={() => setSelectedProduct(id as ProductId)}
                className="p-6 rounded-2xl bg-crucible border border-white/10 hover:border-tiger/50 transition-colors text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold group-hover:text-tiger transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-tiger font-bold">{product.priceDisplay}</span>
                </div>
                <p className="text-sm text-white/60">{product.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setTxHash(null);
              }}
              className="text-white/60 hover:text-white mb-4 text-sm flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Choose different product
            </button>

            <USDCPayment
              productId={selectedProduct}
              onSuccess={handleSuccess}
            />

            {txHash && (
              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-green-300 font-medium mb-2">
                  Payment verified on-chain!
                </p>
                <code className="text-xs text-white/60 break-all">{txHash}</code>
              </div>
            )}
          </div>
        )}

        {/* Info box */}
        <div className="mt-16 max-w-2xl mx-auto p-6 rounded-2xl bg-tiger/10 border border-tiger/30">
          <h3 className="font-bold text-tiger mb-2">How it works</h3>
          <ol className="text-sm text-white/70 space-y-2">
            <li>1. Connect your wallet (Coinbase, MetaMask, etc.)</li>
            <li>2. Approve the USDC transfer</li>
            <li>3. USDC goes directly to our treasury</li>
            <li>4. We verify the tx on-chain and deliver your content</li>
          </ol>
          <p className="text-xs text-white/50 mt-4">
            Currently on Base Sepolia testnet. Get test USDC from a faucet to try it out.
          </p>
        </div>
      </main>
    </div>
  );
}
