<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';
import CryptoFarm from '../../contract/artifacts/contracts/CryptoFarm.sol/CryptoFarm.json';

// 1. 基础配置
const contractAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";
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
    await loadPlots();
  } else {
    alert("请安装 MetaMask!");
  }
};
// 1. 加载地块数据
const loadPlots = async () => {
  if (!account.value) return;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const data = await contract.getplots(account.value);
    // data 是一个 Proxy 数组，我们需要把它转为普通数组供 Vue 使用
    plots.value = data.map(p => ({
      status: Number(p.status),
      plantTime: Number(p.plantTime),
      croptype: Number(p.croptype),
      wateredays: Number(p.wateredays),
      lastwatertime: Number(p.lastwatertime)
    }));
  } catch (error) {
    console.error("加载地块失败:", error);
  }
};

// 2. 加入农场 (领初始的 3 块地)
const joinFarm = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.joinplot();
  await tx.wait();
  await loadPlots(); // 刷新
};

// 3. 种植 (这里假设种 1 号作物)
const plantSeed = async (index) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.plant(index, 1); 
  await tx.wait();
  await loadPlots();
};

// 4. 浇水
const waterPlot = async (index) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.water(index);
  await tx.wait();
  await loadPlots();
};

// 5. harvest
const harvestPlot = async (index) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.harvest(index);
  await tx.wait();
  await loadPlots();
};
</script>

<template>
  <div class="farm-container">
    <div v-if="!account">
      <button @click="connectWallet">连接钱包</button>
    </div>
    
    <div v-else>
      <div v-if="plots.length === 0">
        <p>你还没有加入农场！</p>
        <button @click="joinFarm">领取 3 块初始田地</button>
      </div>

      <div class="grid" v-else>
        <div v-for="(plot, index) in plots" :key="index" class="plot">
          <h3>地块 #{{ index }}</h3>
          <p>状态: {{ ['空闲', '待浇水', '生长中', '可收获'][plot.status] }}</p>
          <p>已浇水次数: {{ plot.wateredays }} / 3</p>

          <button v-if="plot.status === 0" @click="plantSeed(index)">🌱 种植</button>
          <button v-if="plot.status === 1" @click="waterPlot(index)">💧 浇水</button>
          <button v-if="plot.status === 3" @click="harvestPlot(index)">🌾 收获</button>
        </div>
      </div>
    </div>
  </div>
</template>