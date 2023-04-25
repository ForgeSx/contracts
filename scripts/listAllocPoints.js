const {ethers} = require("hardhat");
const hre = require("hardhat");

main()
async function main() {
  let mc = await hre.ethers.getContractAt("MasterChef", "0xD98C6b2abD032D7FAACDFD997162CD7eA0fD95E4");
  
  let nPools = await mc.poolLength()
  nPools = nPools.toNumber()
  console.log(nPools+' pools found')
  
  for (let i = 0; i < nPools; i++) {
    let pool = await mc.poolInfo(i)
    console.log(pool.allocPoint.toNumber(), pool.lpToken)
  }
}
