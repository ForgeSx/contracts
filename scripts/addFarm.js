const {ethers} = require("hardhat");
const hre = require("hardhat");

let alloc = 1000
let lpAddress = '0x2464BDb9f15BA637d4007Ae4c097cA57e3e3fA73'

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
