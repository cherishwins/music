/** @type {import('next').NextConfig} */
const nextConfig = {
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
