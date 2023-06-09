const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}
let weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'

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

  const factory = await deploy("UniswapV2Factory", acc[0].address)
  const router = await deploy("UniswapV2Router02", factory.address, weth)

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
