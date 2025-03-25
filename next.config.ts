import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactStrictMode: false,
  images: {
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "ricmvkntmvhlthwwrjdy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**", // Adjust this if your path structure differs
      },
      {
        
        protocol: "https",
        hostname: "api.multiavatar.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
