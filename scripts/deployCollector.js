const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}
let collector = '0x3Be54346E6DbC435931178EAc7730ab513EcE4C0'

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

  // const collector = await deploy("FeeCollector")

  // MasterChef 9.09% emission fee
  let mc = await hre.ethers.getContractAt("MasterChef", "0xD98C6b2abD032D7FAACDFD997162CD7eA0fD95E4");
  await mc.setDevAddress(collector)

  // Swap 0.05% trade fee
  let factory = await hre.ethers.getContractAt("UniswapV2Factory", "0x2f0a2b314EEcc6BA33B3dd4F46816a2196C8AF3A");
  await factory.setFeeTo(collector)

  // Forge 0.1% withdraw collateral fee
  let forge = await hre.ethers.getContractAt("Forge", "0x4938D2016e7446a24b07635611bD34289Df42ECb");
  await forge.setCollector(collector)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
