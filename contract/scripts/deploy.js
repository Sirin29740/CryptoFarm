const hre = require("hardhat");

async function main() {
  console.log("🚀 正在本地部署 CryptoFarm...");

  const CryptoFarm = await hre.ethers.getContractFactory("CryptoFarm");
  const farm = await CryptoFarm.deploy();

  await farm.waitForDeployment();

  console.log("✅ 部署成功！");
  console.log("📍 合约地址:", await farm.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});