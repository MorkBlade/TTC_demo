<template>
  <section class="connect-device">
    <div class="section-content">
      <h1 class="section-title">{{ t('messages.connectTitle') }}</h1>
      <p class="section-description">{{ t('messages.connectDesc') }}</p>
      <div class="connect-device__compatibility">
        <div class="connect-device__compatibility-item">
          <t-icon name="desktop" size="20" />
          <span>{{ t('messages.connectTip1') }}</span>
          <span>{{ t('messages.connectTip2') }}</span>
          <span>{{ t('messages.connectTip3') }}</span>
        </div>
      </div>
      <button type="button" class="connect-device__button" @click="handleDeviceStoreClick">
        <strong>{{ t('messages.connectBtn') }}</strong>
        <div class="connect-device__container-stars">
          <div class="connect-device__stars"></div>
        </div>
        <div class="connect-device__glow">
          <div class="connect-device__circle"></div>
          <div class="connect-device__circle"></div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Router } from 'vue-router';
import { useDeviceStore } from '@/store';
import { t } from '@/locales';

const router: Router = useRouter();
const deviceStore = useDeviceStore();

// 连接按钮点击事件
const handleDeviceStoreClick = async (): Promise<void> => {
  const data: boolean = await deviceStore.connectDevice();
  if (data) router.push({ name: 'device' });
};
</script>

<style scoped lang="less">
.connect-device {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  object-fit: contain; // 添加这行
  background-image: url('@/assets/images/背景.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-clip: padding-box; // 控制背景的裁剪区域
  background-origin: padding-box; // 控制背景的起始位置

  & .section-content {
    margin-top: 200px;
    margin-bottom: 255px;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1400px;
    text-align: center;

    & .section-title {
      margin-bottom: 2rem;
      font-weight: 800;
      font-size: 8vw;
      line-height: 1.1;
      letter-spacing: -2px;
      text-transform: uppercase;
      background: var(--gradient);
      background-size: 300%;
      background-clip: text;
      animation: gradient 8s linear infinite;
      -webkit-text-fill-color: transparent;
    }

    & .section-description {
      padding: 0 1rem;
      font-size: 1rem;
    }

    & .section-description {
      max-width: 800px;
      margin: 0 auto;
      color: white;
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.8;
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20rem;
    height: 4rem;
    margin: 100px auto 0;
    overflow: hidden;
    background-image:
      linear-gradient(#212121, #212121), linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #04f 87%);
    background-size: 300% 300%;
    background-clip: content-box, border-box;
    background-origin: border-box;
    border: double 4px transparent;
    border-radius: 5rem;
    cursor: pointer;
    backdrop-filter: blur(1rem);
    transition: 0.5s;
    animation: gradient301 5s ease infinite;

    .connect-device__container-stars {
      position: absolute;
      z-index: -1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 5rem;
      backdrop-filter: blur(1rem);
      transition: 0.5s;
    }

    strong {
      z-index: 2;
      color: #fff;
      font-size: 20px;
      letter-spacing: 5px;
      text-shadow: 0 0 4px white;
    }

    .connect-device__glow {
      position: absolute;
      display: flex;
      width: 12rem;
    }

    .connect-device__circle {
      z-index: -1;
      width: 100%;
      height: 30px;
      filter: blur(2rem);
      animation: pulse3011 4s infinite;
    }

    .connect-device__circle:nth-of-type(1) {
      background: rgb(254 83 186 / 63.6%);
    }

    .connect-device__circle:nth-of-type(2) {
      background: rgb(142 81 234 / 70.4%);
    }

    &:hover .connect-device__container-stars {
      z-index: 1;
      background-color: #212121;
    }

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      background-clip: content-box, border-box;
      background-origin: border-box;
      border: double 4px #fe53bb;
      animation: none;
    }

    &:active .connect-device__circle {
      background: #fe53bb;
    }

    .connect-device__stars {
      position: relative;
      width: 200rem;
      height: 200rem;
      background: transparent;
    }

    .connect-device__stars::after {
      position: absolute;
      top: -10rem;
      left: -100rem;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(#fff 1px, transparent 1%);
      background-size: 50px 50px;
      animation: animstarrotate 90s linear infinite;
      content: '';
    }

    .connect-device__stars::before {
      position: absolute;
      top: 0;
      left: -50%;
      width: 170%;
      height: 500%;
      background-image: radial-gradient(#fff 1px, transparent 1%);
      background-size: 50px 50px;
      opacity: 0.5;
      animation: animstar 60s linear infinite;
      content: '';
    }

    @keyframes animstar {
      from {
        transform: translateY(0);
      }

      to {
        transform: translateY(-135rem);
      }
    }

    @keyframes animstarrotate {
      from {
        transform: rotate(360deg);
      }

      to {
        transform: rotate(0);
      }
    }

    @keyframes gradient301 {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes pulse3011 {
      0% {
        box-shadow: 0 0 0 0 rgb(0 0 0 / 70%);
        transform: scale(0.75);
      }

      70% {
        box-shadow: 0 0 0 10px rgb(0 0 0 / 0%);
        transform: scale(1);
      }

      100% {
        box-shadow: 0 0 0 0 rgb(0 0 0 / 0%);
        transform: scale(0.75);
      }
    }
  }

  &__compatibility {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 30px;
    margin-bottom: 32px;
    animation: slide-in-bec76fb2 0.8s ease-out 0.3s backwards;

    &-item {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      color: rgb(255 255 255 / 80%);
      font-size: 16px;

      .t-icon {
        color: #fff;
      }
    }
  }

  @keyframes slide-in {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}

.connect-footer {
  padding: 1rem;
  color: #fff;
  text-align: center;
}
</style>
