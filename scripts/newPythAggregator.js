const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}
let divisorDecimals = 8
let pythAddress = "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C"
let oracle0 = "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688"
let oracle1 = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3" // usdc/usd

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

  let divisor = await deploy("AggregatorDivisorPyth", divisorDecimals, pythAddress, oracle0, oracle1)

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
