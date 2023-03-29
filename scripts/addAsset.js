const {ethers} = require("hardhat");
const hre = require("hardhat")

let deployed = {}
let forgeAddr = "0x99a4D750a50e6BBA06A81187eD699662f17221c1"
let assetName = "Forged Euro"
let assetSymbol = "fEUR"
let depositRatio = "110000000"
let liqThreshold = "108000000"
let divisorDecimals = 8
let oracle0 = "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910"
let oracle1 = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E" // usdc/usd

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
