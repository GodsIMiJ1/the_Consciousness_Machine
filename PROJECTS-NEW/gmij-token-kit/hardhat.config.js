require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL_BASE_SEPOLIA, ETHERSCAN_API_KEY_BASE, RPC_URL_POLYGON, ETHERSCAN_API_KEY_POLYGON } = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    baseSepolia: {
      url: RPC_URL_BASE_SEPOLIA || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    polygon: {
      url: RPC_URL_POLYGON || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: ETHERSCAN_API_KEY_BASE || "",
      polygon: ETHERSCAN_API_KEY_POLYGON || "",
      polygonAmoy: ETHERSCAN_API_KEY_POLYGON || ""
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};