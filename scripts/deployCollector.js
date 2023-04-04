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

  const collector = await deploy("FeeCollector")

  // // MasterChef 9.09% emission fee
  // let mc = await hre.ethers.getContractAt("MasterChef", "0xA8e7F405A91998A62e0c03e6f5496755be050716");
  // await mc.setDevAddress(collector.address)

  // // Swap 0.05% trade fee
  // let factory = await hre.ethers.getContractAt("UniswapV2Factory", "0x0D69E726C48d2c8D89e4E700538A2D172B6BD0d4");
  // await factory.setFeeTo(collector.address)

  // // Forge 0.1% withdraw collateral fee
  // let forge = await hre.ethers.getContractAt("Forge", "0x99a4D750a50e6BBA06A81187eD699662f17221c1");
  // await forge.setCollector(collector.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
