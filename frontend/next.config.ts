import type {NextConfig} from 'next';

const nextConfig:NextConfig={
  // Keep project AGENTS.md at repo root; do not auto-generate a frontend copy.
  agentRules:false,
};

export default nextConfig;
