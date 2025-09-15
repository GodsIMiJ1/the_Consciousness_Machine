export type NetKey = "polygon" | "base" | "baseSepolia";

export const NETWORKS: Record<NetKey, {
  chainId: number;
  chainHex: string;
  name: string;
  rpcUrl: string;
  token: string;
  vault: string;
}> = {
  polygon: {
    chainId: 137,
    chainHex: "0x89",
    name: "Polygon",
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-rpc.com",
    token: process.env.NEXT_PUBLIC_GMIJ_TOKEN || "0x6D2067cA89F594B6838B793f19250dCcF81bc0d4",
    vault: process.env.NEXT_PUBLIC_STAKING_VAULT || "0x4085b7f53F49Cc3ebeE5035D0d4072988AC9aDe5",
  },
  base: {
    chainId: 8453,
    chainHex: "0x2105",
    name: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org",
    token: "",
    vault: "",
  },
  baseSepolia: {
    chainId: 84532,
    chainHex: "0x14A34",
    name: "Base Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    token: "",
    vault: "",
  },
};
