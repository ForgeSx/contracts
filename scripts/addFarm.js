const {ethers} = require("hardhat");
const hre = require("hardhat");

let alloc = 1000
let lpAddress = '0xe7D70FfB91Fbd5e9065bD9a863E6AB3FCC9c7632'

main()
async function main() {
  let mc = await hre.ethers.getContractAt("MasterChef", "0xA8e7F405A91998A62e0c03e6f5496755be050716");
  
  let nPools = await mc.poolLength()
  console.log(nPools)
  
  let tx = await mc.add(
    alloc,
    lpAddress,
    true
  )
  await tx.wait()
  console.log(tx)
}
