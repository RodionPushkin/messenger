<template>
  <form autocomplete="off" class="container" @submit.prevent="send">
    <div class="wrapper">
      <h1>Авторизация</h1>
      <div class="stepper">
        <div v-if="step == 0" class="step">
          <div class="input">
            <input v-model="candidate.phone" placeholder=" " type="text">
            <label>Почта или телефон</label>
          </div>
          <div id="captcha-container" ref="captcha"></div>
          <button type="button" @click="sendPhone" :disabled="this.candidate.phone.length <= 11">Далее</button>
        </div>
        <div v-if="step == 1" class="step">
          <p>Код из смс</p>
          <div class="input-code">
            <input placeholder=" " type="number" @input="handleChangeCode">
            <label>{{ candidate.code[0] }}</label>
            <label>{{ candidate.code[1] }}</label>
            <label>{{ candidate.code[2] }}</label>
            <label>{{ candidate.code[3] }}</label>
            <label>{{ candidate.code[4] }}</label>
            <label>{{ candidate.code[5] }}</label>
          </div>
          <a :class="{clickable:candidate.code_counter<=0}" @click="()=>{if(candidate.code_counter<=0){step = 0;sendPhone()}}">{{candidate.code_counter > 0 ? `новый код можно отправить через ${candidate.code_counter}c` : "отправить еще раз"}}</a>
          <button type="button" @click="sendCode" :disabled="this.candidate.code.length != 6">Далее</button>
        </div>
        <div v-if="step == 2" class="step">
          <div class="input">
            <input placeholder=" " type="password" maxlength="32" v-model="candidate.password">
            <label>Пароль</label>
          </div>
          <button type="submit" :disabled="this.candidate.password.length < 6">Войти</button>
        </div>
      </div>
      <router-link to="/signup" v-if="step == 0">зарегистрироваться</router-link>
    </div>
  </form>
</template>
<script>


export default {
  name: "auth",
  data() {
    return {
      step: 0,
      candidate: {
        code: '',
        code_counter: 60,
        code_interval: undefined,
        code_timeout: undefined,
        phone: '',
        password: '',
      },
    }
  },
  computed: {
    smart_token() {
      return this.$store.getters.SMARTTOKEN
    }
  },
  mounted() {
    this.renderCaptcha()
    this.$watch('candidate.phone', function (n, o) {
      this.candidate.phone = this.formatPhone(n)
    });
  },
  methods: {
    send() {
      try {
        this.$api.user_signin(this.candidate.phone,
            this.candidate.password,this.candidate.code,this.smart_token).then(()=>{
          this.$router.push('/')
        })
      }catch (e) {

      }
    },
    next() {
      this.step++
    },
    handleChangeCode(e) {
      let code = e.target.value
      code = code.toString().replace(/\D/g, '').toString().slice(0, 6)
      e.target.value = code
      this.candidate.code = code
      if(this.candidate.code.length == 6){
        this.sendCode()
      }
    },
    sendPhone(){
      if(this.smart_token.length > 0){
        try {
          const body = {
            token: this.smart_token
          }
          if(this.candidate.phone.replace(/\D/g, "").length == 11){
            body.phone = "+"+this.candidate.phone.replace(/\D/g, "")
          }else{
            body.email = this.candidate.phone
          }
          this.$api.post('/utils/check_phone',{},body).then((res)=>{
            if(res.passed){
              this.candidate.code_counter = 60
              clearInterval(this.candidate.code_interval)
              this.candidate.code_interval = setInterval(()=>{
                this.candidate.code_counter--
                if(this.candidate.code_counter <= 0){
                  clearInterval(this.candidate.code_interval)
                }
              },1000)
              this.next()
              if(res.code){
                this.candidate.code = res.code
                this.sendCode()
              }
            }else{
              // мб уведомление
            }
          })
        }catch (e) {
          // мб уведомление
        }
      }else{
        window.smartCaptcha.execute()
      }
    },
    sendCode(){
      clearTimeout(this.candidate.code_timeout)
      this.candidate.code_timeout = setTimeout(()=>{
        if(this.candidate.code.length == 6){
          try {
            const body = {
              token: this.smart_token,
              code: this.candidate.code
            }
            if(this.candidate.phone.replace(/\D/g, "").length == 11){
              body.phone = "+"+this.candidate.phone.replace(/\D/g, "")
            }else{
              body.email = this.candidate.phone
            }
            this.$api.post('/utils/check_code',{},body).then((res)=>{
              if(res.passed){
                clearInterval(this.candidate.code_interval)
                this.next()
              }else{
                // мб уведомление
              }
            })
          }catch (e) {
            // мб уведомление
          }
        }
      },700)
    },
    async captchaCallback(token) {
      console.log({token})
      this.$store.dispatch('SET_SMART_TOKEN',token)
      this.sendPhone()
    },
    renderCaptcha(){
      window.smartCaptcha.render(this.$refs.captcha.id, {
        sitekey: 'ysc1_UgrBrdOVGUamKwbke1zwYuNxH2zTrKp0uJJlvL6a3675cc74',
        invisible: true,
        callback: this.captchaCallback,
        hideShield: true,
      });
    },
    formatPhone(number) {
      let clearNumber = number.toString();
      let formattedValue = "";
      if (clearNumber != "") {
        if (
            clearNumber[0] == 7 ||
            clearNumber[0] == 8 ||
            clearNumber[0] == "+" ||
            clearNumber[0] == 9
        ) {
          clearNumber = clearNumber.replace(/\D/g, "")
          if (clearNumber[0] == 9 || clearNumber[0] == 8 || clearNumber[0] == 7) {
            formattedValue = "+7 (" + clearNumber[0];
          }
          if (clearNumber[0] == 8 || clearNumber[0] == 7) {
            formattedValue = "+7 (";
          }
          if (clearNumber.length > 1) {
            formattedValue += clearNumber.substring(1, 4);
          }
          if (clearNumber.length >= 5) {
            formattedValue += ") " + clearNumber.substring(4, 7);
          }
          if (clearNumber.length >= 8) {
            formattedValue += "-" + clearNumber.substring(7, 9);
          }
          if (clearNumber.length >= 10) {
            formattedValue += "-" + clearNumber.substring(9, 11);
          }
        } else {
          return clearNumber
        }
      }
      return formattedValue;
    },
  }
}
</script>

<style lang="scss" scoped>
.container {
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  h1 {
    font-size: var(--font-xl);
  }
  .clickable{
    cursor: pointer;
    color: var(--color-accent);
    &:hover{
      color: var(--color-accent-75);
    }
  }
  .step {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stepper {
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    border-radius: var(--border-radius);
    background: var(--color-main);
    border: 1px solid var(--color-accent);
  }
}
</style>
