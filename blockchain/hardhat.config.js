require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: process.env.SERVER_WALLET_PRIVATE_KEY
        ? [process.env.SERVER_WALLET_PRIVATE_KEY]
        : [],
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    scripts: "./scripts", 
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};
