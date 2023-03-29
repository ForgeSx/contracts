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

  const stable =  await deploy("StableCoin", 'US Dollar', 'USD')
  await stable.mint(acc[0].address, "1000000000000") // mint 1M USD to deployer
  const forge = await deploy("Forge", stable.address, 6, "100000000") // 100$ minimum collateral

  // const synth =  await deploy("ForgeAsset", 'Synthetic Gold', 'sXAU')
  // let MINTER_ROLE = await synth.MINTER_ROLE()
  // let BURNER_ROLE = await synth.BURNER_ROLE()
  // await synth.grantRole(MINTER_ROLE, forge.address)
  // await synth.grantRole(BURNER_ROLE, forge.address)
  // const oracle = await deploy("MockV3Aggregator", 8, "1000000000") // 8 decimals, start price 10$
  // await forge.addAsset(synth.address, oracle.address, false, "130000000", "125000000") // 130% min cratio, 125% liq
  // console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
