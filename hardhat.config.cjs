require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mocaDevnet: {
      url: "https://devnet-rpc.mocachain.org",
      chainId: 5151,
      accounts: ["0xa9998fbd72787da8ceafb29f2168013d33304ab97cdfb99273e8cb9cb1a3026f"],
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      mocaDevnet: "no-api-key-needed"
    },
    customChains: [
      {
        network: "mocaDevnet",
        chainId: 5151,
        urls: {
          apiURL: "https://devnet-scan.mocachain.tech/api",
          browserURL: "https://devnet-scan.mocachain.tech"
        }
      }
    ]
  }
};
