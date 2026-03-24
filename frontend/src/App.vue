<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';
import CryptoFarm from '../../contract/artifacts/contracts/CryptoFarm.sol/CryptoFarm.json';

// 1. 基础配置
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = CryptoFarm.abi; // 拿到 ABI 数组

const account = ref(null);
const plots = ref([]);
const farmContract = ref(null);

// 2. 连接钱包
const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    account.value = await signer.getAddress();
    farmContract.value = new ethers.Contract(contractAddress, abi, signer);
    await fetchPlots();
  } else {
    alert("请安装 MetaMask!");
  }
};

// 3. 获取土地状态
const fetchPlots = async () => {
  if (farmContract.value) {
    // 调用你合约里的 getplots 函数
    const data = await farmContract.value.getplots(account.value);
    plots.value = data.map(p => ({
      status: Number(p.status), // 0:Empty, 1:Unwatered, 2:Growing, 3:Ready
      wateredDays: Number(p.wateredays),
      cropType: Number(p.croptype)
    }));
  }
};

// 4. 浇水动作
const waterPlot = async (index) => {
  try {
    const tx = await farmContract.value.water(index);
    await tx.wait(); // 等待上链
    await fetchPlots(); // 刷新数据
    alert("浇水成功！");
  } catch (err) {
    console.error(err);
  }
};

const plantSeed = async (index) => {
  console.log("准备在土地编号 " + index + " 播种...");
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // 假设你的合约函数名叫 plant
    // const tx = await contract.plant(index); 
    // await tx.wait();
    
    alert("播种指令已发送！");
  } catch (error) {
    console.error("播种失败:", error);
  }
};
</script>

<template>
  <div class="farm-container">
    <h1>星露谷加密农场</h1>
    
    <button v-if="!account" @click="connectWallet">连接钱包</button>
    <p v-else>当前钱包: {{ account }}</p>

    <div class="grid">
      <div v-for="(plot, index) in plots" :key="index" class="plot-card">
        <h3>土地 #{{ index }}</h3>
        <p>状态: {{ ['空地', '待浇水', '生长中', '成熟'][plot.status] }}</p>
        <p>已浇水: {{ plot.wateredDays }} 天</p>
        
        <button v-if="plot.status === 1" @click="waterPlot(index)">💧 浇水</button>
        <button v-if="plot.status === 0" @click="plantSeed(index)">🌱 种植</button>
      </div>
    </div>
  </div>
</template>