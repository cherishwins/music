/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server for the Docker image. The Dockerfile sets
  // NEXT_OUTPUT=standalone; Vercel and local builds leave it unset and are
  // unchanged.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
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
