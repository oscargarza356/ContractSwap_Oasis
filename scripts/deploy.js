// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ethers");
const { upgrades } = require("hardhat");

async function main() {
  const [owner, dev1] = await ethers.getSigners();
  console.log("owner", owner.address);
  const ContractSwap = await hre.ethers.getContractFactory("ContractSwap");
  const contractSwapInstance = await upgrades.deployProxy(ContractSwap);
  const contractSwap = await contractSwapInstance.deployed();
  console.log("ContractSwap contract owner", await contractSwap.owner());
  console.log("ContractSwap Address", contractSwap.address);
  fs.writeFileSync(
    "./src/config.js",
    `
  export const contractSwapAddress = "${contractSwap.address}"
  `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
