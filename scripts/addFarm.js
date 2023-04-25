const {ethers} = require("hardhat");
const hre = require("hardhat");

let alloc = 1000
let lpAddress = '0xa25c778AA287f29F3972aD30a1b260b95f6829F6'

main()
async function main() {
  let mc = await hre.ethers.getContractAt("MasterChef", "0xD98C6b2abD032D7FAACDFD997162CD7eA0fD95E4");
  
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
