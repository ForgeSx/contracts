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

  const factory = await deploy("UniswapV2Factory", acc[0].address)
  const weth = await deploy("MockWETH")
  const router = await deploy("UniswapV2Router02", factory.address, weth.address)

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
