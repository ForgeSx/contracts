const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}
let forgeAddr = "0x4938D2016e7446a24b07635611bD34289Df42ECb"
let assetName = "Forged Chinese Yuan"
let assetSymbol = "fCNY"
let depositRatio = "115000000"
let liqThreshold = "110000000"
let divisorDecimals = 8
let oracle0 = "0xcC3370Bde6AFE51e1205a5038947b9836371eCCb"
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

  let forge = await hre.ethers.getContractAt("Forge", forgeAddr);
  const synth =  await deploy("ForgeAsset", assetName, assetSymbol)
  let MINTER_ROLE = await synth.MINTER_ROLE()
  let BURNER_ROLE = await synth.BURNER_ROLE()
  await synth.grantRole(MINTER_ROLE, forge.address)
  await synth.grantRole(BURNER_ROLE, forge.address)

  let divisor = await deploy("AggregatorDivisor", divisorDecimals, oracle0, oracle1)
  await forge.addAsset(synth.address, divisor.address, false, depositRatio, liqThreshold)

  console.log(deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
