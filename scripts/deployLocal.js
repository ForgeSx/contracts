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

  // utils
  const multicall = await deploy("Multicall3")
  const usdc = await deploy("StableCoin", "USDC", "USDC")
  let tx = await usdc.mint(acc[0].address, "1000000000000")
  await tx.wait()

  // forge
  const forge = await deploy("Forge", usdc.address, 6, "200000000") // 200$ minimum collateral

  // add fXAU to forge
  const synth =  await deploy("ForgeAsset", 'Forged Gold 1oz', 'fXAU')
  let MINTER_ROLE = await synth.MINTER_ROLE()
  let BURNER_ROLE = await synth.BURNER_ROLE()
  await synth.grantRole(MINTER_ROLE, forge.address)
  await synth.grantRole(BURNER_ROLE, forge.address)
  const oracle = await deploy("MockV3Aggregator", 8, "200000000000") // 8 decimals, start price 2000$
  await forge.addAsset(synth.address, oracle.address, false, "130000000", "125000000") // 130% min cratio, 125% liq
  
  // swap
  const factory = await deploy("UniswapV2Factory", acc[0].address)
  const router = await deploy("UniswapV2Router02", factory.address, "0x82af49447d8a07e3bd95bd0d56f35241523fbab1")
  
  // farm
  const forgeToken = await deploy("contracts/ForgeToken.sol:ForgeToken", 'Forge Token', 'FORGE')
  tx = await forgeToken.mint(acc[0].address, "30000000000000000000000") // 30000 tokens initial supply
  await tx.wait()
  let startTime = Math.floor(new Date().getTime() / 1000) + 60 // starts in 1 minute
  const masterchef = await deploy(
    "MasterChef",
    forgeToken.address,
    acc[0].address,
    "50000000000000000", // 0.05 forge per second
    startTime
  )
  await forgeToken.transferOwnership(masterchef.address)

  // veFORGE
  const veArt = await deploy("VeArtProxy")
  const veForge = await deploy("VotingEscrow", forgeToken.address, veArt.address)
  const feeCollector = await deploy("FeeCollector")
  const rewardsDistributor = await deploy("RewardsDistributor", veForge.address, feeCollector.address, usdc.address, acc[0].address, 5000)
  tx = await feeCollector.transferOwnership(rewardsDistributor.address)
  await tx.wait()
  tx = await await usdc.transfer(feeCollector.address, "10000000000")
  await tx.wait()
  tx = await await forgeToken.transfer(feeCollector.address, "10000000000000000000000")
  await tx.wait()

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
