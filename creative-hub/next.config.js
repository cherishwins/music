/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server for the Docker image. The Dockerfile sets
  // NEXT_OUTPUT=standalone; Vercel and local builds leave it unset and are
  // unchanged.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // The UI offers USDC (x402) only when src/lib/x402-network.ts says the
  // server takes it, so the browser needs the same (public) settings.
  env: {
    NEXT_PUBLIC_X402_NETWORK: process.env.X402_NETWORK || "",
    NEXT_PUBLIC_X402_PAYMENT_ADDRESS: process.env.X402_PAYMENT_ADDRESS || "",
    NEXT_PUBLIC_X402_DEPLOY_ENV: process.env.VERCEL_ENV || "",
  },
  images: {
    domains: ["stream.mux.com", "image.mux.com"],
  },
  transpilePackages: ["three"],
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
};

module.exports = nextConfig;
