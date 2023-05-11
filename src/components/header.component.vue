<template>
  <header class="header">
    <div class="container">
      <router-link class="logo" to="/" @click="isMenuOpened = false">лого</router-link>
      <input id="burger" v-model="isMenuOpened" type="checkbox">
      <label for="burger">
        <svg class="feather feather-menu" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <line x1="3" x2="21" y1="12" y2="12"></line>
          <line x1="3" x2="21" y1="6" y2="6"></line>
          <line x1="3" x2="21" y1="18" y2="18"></line>
        </svg>
      </label>
      <nav class="nav">
        <router-link to="/" @click="isMenuOpened = false">главная</router-link>
        <!--        <router-link @click="isMenuOpened = false" to="/panel">панель</router-link>-->
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: "header.component",
  data() {
    return {
      isMenuOpened: false
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(22px);
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 997;
  padding: 24px 0;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    font-size: 24px;
    font-weight: 500;
    user-select: none;

    span:first-child {
      color: #0c5fff;
    }

    span:last-child {
      color: var(--main-color);
    }
  }

  .nav {
    display: flex;
    gap: 32px;
    align-items: center;
    font-size: 18px;

    a {
      user-select: none;
    }
  }

  input {
    display: none;
  }

  label {
    display: none;
  }

  @media screen and (max-width: 768px) {
    background: var(--bg-color);
    backdrop-filter: none;
    .logo {
      z-index: 999;
    }
    .nav {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      width: 100vw;
      height: 100vh;
      left: 100vw;
      top: 0;
      opacity: 0;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(22px);
    }
    label {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      position: relative;
      z-index: 999;
      cursor: pointer;
    }
    input:checked ~ label {
      transform: rotate(-90deg);
    }
    input:checked ~ .nav {
      display: flex;
      left: 0;
      opacity: 1;
      transition: opacity 0.4s linear, left 0.3s linear;
      z-index: 998;
    }
  }
}
</style>
<style lang="scss">
.header .nav a {
  user-select: none;
  transition: opacity 0.2s linear;
  padding: 6px;

  &.router-link-active {
    //border-bottom: 1px solid var(--font-color);
    //color: var(--main-color);
  }

  @media screen and (max-width: 768px) {
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
