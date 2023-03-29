const {ethers} = require("hardhat");
const hre = require("hardhat");

main()
async function main() {
  let mc = await hre.ethers.getContractAt("MasterChef", "0xA8e7F405A91998A62e0c03e6f5496755be050716");
  
  let nPools = await mc.poolLength()
  nPools = nPools.toNumber()
  console.log(nPools+' pools found')
  
  for (let i = 0; i < nPools; i++) {
    let pool = await mc.poolInfo(i)
    console.log(pool.allocPoint.toNumber(), pool.lpToken)
  }
}
