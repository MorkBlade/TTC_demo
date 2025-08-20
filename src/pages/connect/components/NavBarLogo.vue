<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo">{{ t('messages.navLogo') }}</div>
      <button class="mobile-nav-toggle" aria-label="Toggle navigation">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      <ul class="nav-links">
        <li>
          <a href="https://hub.sparklinkplayjoy.com/connect" target="_blank">{{ t('messages.navOldDriver') }}</a>
        </li>
        <li>
          <a href="https://delay.sparklinkplayjoy.com/home" target="_blank">{{ t('messages.navDelayTool') }}</a>
        </li>
        <li>
          <a href="http://www.sparklinkplayjoy.com/?contact/" target="_blank">{{ t('messages.navAboutUs') }}</a>
        </li>
        <li>
          <a href="https://bbs.sparklinkplayjoy.com/" target="_blank">{{ t('messages.navCommunity') }}</a>
        </li>
      </ul>
    </div>
  </nav>
  <div class="overlay"></div>
</template>

<script setup>
import { t } from '@/locales';
</script>

<style scoped lang="less">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  padding: 1.2rem 5%;
  background: var(--glass-bg);
  border-bottom: var(--border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar.scrolled {
  padding: 0.8rem 5%;
  background: rgb(10 10 10 / 95%);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
  background: var(--gradient);
  background-size: 300%;
  background-clip: text;
  animation: gradient 8s linear infinite;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}

.nav-links a {
  position: relative;
  padding: 0.5rem 0;
  color: white;
  font-weight: 500;
  font-size: 1.05rem;
  letter-spacing: 0.3px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-links a::before {
  position: absolute;
  top: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient);
  background-size: 300%;
  transition: width 0.3s ease;
  content: '';
}

.nav-links a::after {
  position: absolute;
  right: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: var(--gradient);
  background-size: 300%;
  transition: width 0.3s ease;
  content: '';
}

.nav-links a:hover {
  color: #fff;
  text-shadow: 0 0 8px rgb(255 255 255 / 30%);
}

.nav-links a:hover::before,
.nav-links a:hover::after {
  width: 100%;
  animation: gradient 8s linear infinite;
}

.mobile-nav-toggle {
  position: relative;
  z-index: 1001;
  display: none;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mobile-nav-toggle:hover {
  background-color: rgb(255 255 255 / 10%);
}

.mobile-nav-toggle .bar {
  position: absolute;
  left: 50%;
  width: 20px;
  height: 2px;
  background: white;
  transform: translateX(-50%);
  transition: all 0.4s ease;
}

.mobile-nav-toggle .bar:nth-child(1) {
  top: 14px;
}

.mobile-nav-toggle .bar:nth-child(2) {
  top: 19px;
}

.mobile-nav-toggle .bar:nth-child(3) {
  top: 24px;
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

@media (width <= 768px) {
  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    width: 80%;
    max-width: 400px;
    height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, rgb(10 10 10 / 99%), rgb(20 20 20 / 99%));
    box-shadow: -10px 0 30px rgb(0 0 0 / 50%);
    backdrop-filter: blur(10px);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-links::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgb(255 255 255 / 3%));
    content: '';
    pointer-events: none;
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links a {
    font-size: 1.2rem;
    transform: translateX(20px);
    opacity: 0;
    transition: all 0.4s ease;
  }

  .nav-links.active a {
    transform: translateX(0);
    opacity: 1;
  }

  .nav-links a:nth-child(1) {
    transition-delay: 0.1s;
  }

  .nav-links a:nth-child(2) {
    transition-delay: 0.2s;
  }

  .nav-links a:nth-child(3) {
    transition-delay: 0.3s;
  }

  .nav-links a:nth-child(4) {
    transition-delay: 0.4s;
  }

  .nav-links a:nth-child(5) {
    transition-delay: 0.5s;
  }

  .mobile-nav-toggle {
    display: block;
  }

  .mobile-nav-toggle.active .bar:nth-child(1) {
    width: 24px;
    transform: translate(-50%, 5px) rotate(45deg);
  }

  .mobile-nav-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }

  .mobile-nav-toggle.active .bar:nth-child(3) {
    width: 24px;
    transform: translate(-50%, -5px) rotate(-45deg);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 50%);
    visibility: hidden;
    opacity: 0;
    backdrop-filter: blur(4px);
    transition: all 0.4s ease;
  }

  .overlay.active {
    visibility: visible;
    opacity: 1;
  }
}
</style>
