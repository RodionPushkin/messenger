<template>
  <form autocomplete="off" class="container" @submit.prevent="send">
    <div class="wrapper">
      <h1>Регистрация</h1>
      <div class="stepper">
        <div v-if="step == 0" class="step">
          <div class="input">
            <input v-model="candidate.phone" placeholder=" " type="text">
            <label>Телефон</label>
          </div>
          <div id="captcha-container" ref="captcha"></div>
          <button :disabled="this.candidate.phone.replace(/\D/g, '').length != 11" type="button" @click="sendPhone">
            Далее
          </button>
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
          <a :class="{clickable:candidate.code_counter<=0}"
             @click="()=>{if(candidate.code_counter<=0){step = 0;sendPhone()}}">{{ candidate.code_counter > 0 ? `новый код можно отправить через ${candidate.code_counter}c` : "отправить еще раз" }}</a>
          <button :disabled="this.candidate.code.length != 6" type="button" @click="sendCode">Далее</button>
        </div>
        <div v-if="step == 2" class="step">
          <div class="input">
            <input v-model="candidate.email" maxlength="255" placeholder=" " type="email">
            <label>Почта</label>
          </div>
          <div class="input">
            <input v-model="candidate.username" maxlength="32" placeholder=" " type="text">
            <label>Юзернейм</label>
          </div>
          <div class="input">
            <input v-model="candidate.password" maxlength="32" placeholder=" " type="password">
            <label>Пароль</label>
          </div>
          <button type="submit" :disabled="candidate.password.length < 6 || candidate.email.length < 11 || candidate.username < 6">Зарегистрироваться</button>
        </div>
      </div>
      <router-link v-if="step == 0" to="/signin">войти</router-link>
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
        email: '',
        username: '',
        password: '',
        phone: '',
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
        this.$api.user_signup(this.candidate.email,
            this.candidate.password, this.candidate.username, this.candidate.code, this.smart_token, "+" + this.candidate.phone.replace(/\D/g, "")).then(()=>{
          this.$router.push('/')
        })

      } catch (e) {

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
      if (this.candidate.code.length == 6) {
        this.sendCode()
      }
    },
    sendPhone(token) {
      if (this.candidate.phone.replace(/\D/g, '').length != 11) {
        // мб уведомление
      } else {
        if (typeof token == "string") {
          try {
            this.$api.post('/utils/check_phone', {}, {
              phone: "+" + this.candidate.phone.replace(/\D/g, ""),
              token: token
            }).then((res) => {
              if (res.passed) {
                this.candidate.code_counter = 60
                clearInterval(this.candidate.code_interval)
                this.candidate.code_interval = setInterval(() => {
                  this.candidate.code_counter--
                  if (this.candidate.code_counter <= 0) {
                    clearInterval(this.candidate.code_interval)
                  }
                }, 1000)
                this.next()
                if (res.code) {
                  this.candidate.code = res.code
                  this.sendCode()
                }
              } else {
                // мб уведомление
              }
            })
          } catch (e) {
            // мб уведомление
          }
        } else {
          window.smartCaptcha.execute()
        }
      }
    },
    sendCode() {
      clearTimeout(this.candidate.code_timeout)
      this.candidate.code_timeout = setTimeout(() => {
        if (this.candidate.code.length == 6) {
          try {
            this.$api.post('/utils/check_code', {}, {
              phone: "+" + this.candidate.phone.replace(/\D/g, ""),
              token: this.smart_token,
              code: this.candidate.code
            }).then((res) => {
              if (res.passed) {
                clearInterval(this.candidate.code_interval)
                this.next()
              } else {
                // мб уведомление
                clearInterval(this.candidate.code_interval)
                this.next()
              }
            })
          } catch (e) {
            // мб уведомление
          }
        }
      }, 700)
    },
    async captchaCallback(token) {
      console.log({token})
      this.$store.dispatch('SET_SMART_TOKEN', token)
      this.sendPhone(token)
      window.smartCaptcha.reset()
    },
    renderCaptcha() {
      window.smartCaptcha.render(this.$refs.captcha.id, {
        sitekey: 'ysc1_UgrBrdOVGUamKwbke1zwYuNxH2zTrKp0uJJlvL6a3675cc74',
        invisible: true,
        callback: this.captchaCallback,
        hideShield: true,
      });
    },
    formatPhone(number) {
      let clearNumber = number.toString().replace(/\D/g, "");
      let formattedValue = "";
      if (clearNumber != "") {
        if (
            clearNumber[0] == 7 ||
            clearNumber[0] == 8 ||
            clearNumber[0] == 9
        ) {
          if (clearNumber[0] == 9) {
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
          formattedValue = "+" + clearNumber.substring(0, 16);
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

  .clickable {
    cursor: pointer;
    color: var(--color-accent);

    &:hover {
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
