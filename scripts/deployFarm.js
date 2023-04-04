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

  const forgeToken = await deploy("contracts/ForgeToken.sol:ForgeToken", 'Forge Token', 'FORGE')
  let tx = await forgeToken.mint(acc[0].address, "30000000000000000000000") // 30000 tokens
  await tx.wait()
  let startTime = Math.floor(new Date().getTime() / 1000) + 60*60*17 // starts in 17 hours
  const masterchef = await deploy(
    "MasterChef",
    forgeToken.address,
    acc[0].address,
    "50000000000000000", // 0.05 forge per second
    startTime
  )
  await forgeToken.transferOwnership(masterchef.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
