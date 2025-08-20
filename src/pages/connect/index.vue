<template>
  <div class="connect-page">
    <div class="multi-language-float">
      <multi-language />
    </div>
    <nav-bar-logo />
    <connect-device></connect-device>
    <!-- <app-pcb></app-pcb>
    <app-partners></app-partners> -->
    <div class="connect-footer">
      <span>Copyright © 2025 SparkLinkPlayJoy</span>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ConnectIndex' });

import NavBarLogo from './components/NavBarLogo.vue';
import ConnectDevice from './components/ConnectDevice.vue';
import MultiLanguage from '@/pages/device/components/multi-language.vue';
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
}
.multi-language-float {
  position: absolute;
  top: 22px;
  right: 12px;
  z-index: 99999;
}
</style>
