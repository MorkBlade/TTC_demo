<template>
  <section class="connect-device">
    <div class="section-content">
      <h3 class="section-title">{{ t('messages.connectTitle') }}</h3>
      <p class="section-description">{{ t('messages.connectDesc') }}</p>
      <div class="keyboard-img">
        <img :src="keyboardImg" alt="键盘" />
      </div>
      <div class="tip">{{ t('messages.connectBtnTip') }}</div>
      <button type="button" class="connect-device__button" @click="handleDeviceStoreClick">
        <strong>{{ t('messages.connectBtn') }}</strong>
      </button>
      <div class="info">
        <div class="info-item">
          <div class="icon"></div>
          <div class="text">
            <div class="title">查看使用说明书</div>
            <div class="desc">查看指导手册，了解操作方法。</div>
          </div>
        </div>
        <div class="info-item">
          <div class="icon"></div>
          <div class="text">
            <div class="title">访问我们的社群</div>
            <div class="desc">与其他用户互动交流、获取支持及技巧。</div>
          </div>
        </div>
        <div class="info-item">
          <div class="icon"></div>
          <div class="text">
            <div class="title">访问我们的官网</div>
            <div class="desc">获取最新产品动态与权威服务信息。</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Router } from 'vue-router';
import { useDeviceStore } from '@/store';
import { t } from '@/locales';

const router: Router = useRouter();
const deviceStore = useDeviceStore();

const keyboardImg = new URL('@/assets/images/keyboard.svg', import.meta.url).href;

// 连接按钮点击事件
const handleDeviceStoreClick = async (): Promise<void> => {
  const data: boolean = await deviceStore.connectDevice();
  if (data) router.push({ name: 'device' });
};
</script>

<style scoped lang="less">
.connect-device {
  padding-top: 139px;
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
    margin-top: 139px;
    margin-bottom: 255px;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1400px;
    text-align: center;

    & .section-title {
      margin-bottom: 2rem;
      font-weight: 700;
      font-size: 3vw;
      line-height: 1.1;
      letter-spacing: -2px;
      color: #fff;
      background: var(--gradient);
      background-size: 300%;
      background-clip: text;
    }

    & .section-description {
      padding: 0 1rem;
      font-size: 1rem;
    }

    & .section-description {
      max-width: 1000px;
      margin: 0 auto;
      color: white;
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.8;
    }

    & .keyboard-img {
      margin-top: 2rem;
      width: 100%;
      height: 386px;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 100%;
        height: 100%;
      }
    }

    & .tip {
      margin-top: 2rem;
      font-size: 1rem;
      color: #525252;
      opacity: 0.8;
    }
  }

  & .connect-device__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 50px;
    margin: 24px auto 0;
    overflow: hidden;
    background-image: url('@/assets/images/btn_active.svg');
    background-size: 100% 100%; // 修改为完全覆盖按钮区域
    background-position: center;
    background-repeat: no-repeat;
    border: solid 4px transparent;
    cursor: pointer;
    background-color: transparent !important;
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    margin-bottom: 108px;

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
      font-size: 14px;
      letter-spacing: 2px;
      // text-shadow: 0 0 4px white;
    }
    &:hover {
      background-size: 100% 100%;
      transform: scale(1.05);
      transition: all 0.3s ease;
    }
  }

  & .info {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 85%;
    height: 100px;
    margin: 0 auto;
    .info-item {
      width: 360px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      background-image: url('@/assets/images/info_bg.svg');
      background-size: 100% 100%;
      cursor: pointer;
      .icon {
        width: 36px;
        height: 36px;
        background-image: url('@/assets/images/what.svg');
        background-size: 100% 100%;
      }
      .text {
        color: #fff;
        .title {
          font-size: 14px;
          font-weight: 700;
          line-height: 20px;
          color: #fff;
        }
      }
    }
  }
}
</style>
