const { ethers } = require("ethers");
// 1. 填入你的配置
const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x9A676e781A523b5d0C0e43731313A708CB607508";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat Account #0 的私钥

// 2. 简易版 ABI (只需要我们要调用的函数)
const ABI = [
    "function getplots(address player) external view returns (tuple(uint8 status, uint256 plantTime, uint256 croptype, uint256 wateredays, uint256 lastwatertime)[])",
    "function seetunwater(uint256 plotI) external",
    "function setready(uint256 plotI) external"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log("🚀 农场响应式监控脚本已启动...");

    // 轮询检查（模拟 Reactive 触发）
    setInterval(async () => {
        try {
            const plots = await contract.getplots(wallet.address);
            
            for (let i = 0; i < plots.length; i++) {
                const p = plots[i];
                const status = Number(p.status);
                const wateredays = Number(p.wateredays);

                // 逻辑 A: 如果正在生长(2)，尝试转回待浇水(1)
                if (status === 2) {
                    try {
                        console.log(`🌱 地块 ${i} 正在生长，尝试触发 seetunwater...`);
                        const tx = await contract.seetunwater(i);
                        await tx.wait();
                        console.log(`✅ 地块 ${i} 已转为待浇水状态，累积浇水: ${wateredays + 1} 天`);
                    } catch (e) {
                        // 如果报错，通常是合约里的 block.timestamp 还没跨过 24 小时
                        // console.log(`⏳ 地块 ${i} 时间未到，跳过...`);
                    }
                }

                // 逻辑 B: 如果浇够了 3 次水，自动设为 Ready(3)
                if (wateredays === 3 && status !== 3) {
                    console.log(`🌟 地块 ${i} 已满足成熟条件，执行 setready...`);
                    const tx = await contract.setready(i);
                    await tx.wait();
                    console.log(`🎉 地块 ${i} 已成熟，可以收获了！`);
                }
            }
        } catch (error) {
            console.error("轮询出错:", error.message);
        }
    }, 5000); // 每 5 秒巡查一次
}

main();