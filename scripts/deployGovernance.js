const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}

async function deploy(name, ...args) {
  const C = await ethers.getContractFactory(name);
  const c = await C.deploy(...args)
  await c.deployed()
  console.log(`deploy ${name}`, c.address)
  deployed[name] = c.address;
  return c
}

async function main() {
  const acc = await ethers.getSigners()
  console.log('Deployer: '+acc[0].address)

  const veArt = await deploy("VeArtProxy")
  const veForge = await deploy("VotingEscrow", forgeToken.address, veArt.address)
  const rewardsDistributor = await deploy(
    "RewardsDistributor",
    veForge.address,
    "0x5a9d91ba2660446A496C52e3869FBD2A63c0a6BB",
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    "0x3Be54346E6DbC435931178EAc7730ab513EcE4C0",
    5000
  )

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
