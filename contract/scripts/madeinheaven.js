const hre = require("hardhat");

async function main() {
  // 1. 增加 86400 秒 (1天)
  await hre.network.provider.send("evm_increaseTime", [86400]);
  
  // 2. 必须挖一个新块，时间戳才会更新
  await hre.network.provider.send("evm_mine");

  console.log("⏰ 时空穿越成功！本地链时间已快进 1 天。");
}

main().catch(console.error);