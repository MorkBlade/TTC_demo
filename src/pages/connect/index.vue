<template>
  <div class="connect-page">
    <div class="multi-language-float">
      <img :src="logoUrl" alt="logo_ttc" />
      <!-- <multi-language /> -->
    </div>
    <!-- <nav-bar-logo /> -->
    <connect-device></connect-device>
    <!-- <app-pcb></app-pcb>
    <app-partners></app-partners> -->
    <!-- <div class="connect-footer">
      <span>Copyright © 2025 SparkLinkPlayJoy</span>
    </div> -->
  </div>
</template>

<script setup>
defineOptions({ name: 'ConnectIndex' });

// import NavBarLogo from './components/NavBarLogo.vue';
import ConnectDevice from './components/ConnectDevice.vue';
import MultiLanguage from '@/pages/device/components/multi-language.vue';

const logoUrl = new URL('@/assets/images/logo1.png', import.meta.url).href;
</script>

<style scoped lang="less">
.connect-footer {
  padding: 1rem;
  color: #fff;
  text-align: center;
  color: rgb(48, 48, 48);
}
.connect-page {
  position: relative;
  width: 100%;
  height: 100%;
}
.logo {
  // display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  img {
    max-width: 200px;
    height: auto;
  }
}

.multi-language-float {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  padding: 10px 20px;
}
</style>
