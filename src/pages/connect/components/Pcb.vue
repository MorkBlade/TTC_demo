<template>
  <section class="connect-device">
    <div class="section-content">
      <h1 class="section-title">双子星敬请期待</h1>
    </div>
  </section>
</template>
<style scoped lang="less">
.pcb {
  position: relative;
  min-height: 100%;
  margin-top: 0;
  background-position: center;
  background-size: cover;

  &__content {
    width: 100%;
    max-width: 600px;
    color: #fff;
    text-align: center;
  }

  h3 {
    margin-bottom: 12px;
    font-size: 32px;
  }

  p {
    margin-bottom: 24px;
    color: rgb(255 255 255 / 90%);
    font-size: 18px;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .feature-item {
    display: flex;
    gap: 8px;
    align-items: center;
    color: rgb(255 255 255 / 90%);
    font-size: 16px;

    .t-icon {
      color: #fff;
    }
  }
}
</style>
