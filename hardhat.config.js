require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString();
require("@openzeppelin/hardhat-upgrades");
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/ee255ec31f7b41bb83d6a229a7763e9b",
      accounts: [privateKey],
    },
    mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/ee255ec31f7b41bb83d6a229a7763e9b",
      accounts: [privateKey],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/ee255ec31f7b41bb83d6a229a7763e9b",
      accounts: [privateKey],
    },
    luksoL16: {
      live: true,
      url: "https://rpc.l16.lukso.network",
      chainId: 2828,
      accounts: [privateKey], // your private key here
    },
    evmos: {
      url: "https://eth.bd.evmos.org:8545",
      accounts: [privateKey],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts",
  },
  solidity: "0.8.4",
};
