class api {
  constructor(url) {
    this.url = url
  }

  async get(url, headers) {
    return await this.request('get', url, headers)
  }

  async post(url, headers, body) {
    if (body) {
      body = JSON.stringify(body)
    }
    return await this.request('post', url, body, headers)
  }

  async put(url, headers, body) {
    if (body) {
      body = JSON.stringify(body)
    }
    return await this.request('put', url, body, headers)
  }

  async delete(url, headers, body) {
    if (body) {
      body = JSON.stringify(body)
    }
    return await this.request('delete', url, body, headers)
  }

  async upload(url, headers, body) {
    return await this.request('post', url, body, headers)
  }

  async request(method, url, body, headers = {}) {
    if (localStorage.getItem('token')) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
    }
    headers["Content-Type"] = 'application/json'
    headers["Accept"] = 'application/json'
    let data = {
      method: method,
      headers: headers,
      body: body,
    }
    return await fetch(this.url + url, data)
      .then(response => response.json())
      .then((res) => {
        return res
      })
      .catch((err) => {
        return []
      })
  }

  async user_refresh() {
    if (localStorage.getItem('token')) {
      this.put('user/refresh').then((res) => {
        if (res == 'logout') {
          throw "logout"
        } else {
          localStorage.setItem('token', res.access_token)
        }
      }).catch(err => {
        console.log(err)
        if (err == "logout") {
          this.user_logout()
        }
      })
    }
  }

  async user_logout() {
    this.delete('user')
    localStorage.removeItem('token')
    this.$router.push('/')
    this.$peer.destroy()
  }

  async user_signin(phone, password, code, token) {
    const body = {
      password,
      code,
      token
    }
    if (phone.replace(/\D/g, "").length == 11) {
      body.phone = "+" + phone.replace(/\D/g, "")
    } else {
      body.email = phone
    }
    return this.put('user', undefined, body).then(res => {
      if (res.message) {
        console.log(res)
      } else if (res.access_token) {
        localStorage.setItem('token', res.access_token)
        this.$router.push('/')
      }
    }).catch(err => {
      console.log(err)
    })
  }

  async user_signup(email, password, username, code, token, phone) {
    return this.post('user', {}, {email, password, username, code, token, phone}).then(res => {
      if (res.message) {
        console.log(res)
      } else if (res.access_token) {
        localStorage.setItem('token', res.access_token)
        this.$router.push('/')
      }
    }).catch(err => {
      console.log(err)
    })
  }

  async user_self() {
    return this.get('user').then(res => {
      return res
    }).catch(err => {
      console.log(err)
      if (err == "logout") {
        this.user_logout()
      }
      return err
    })
  }
}

export default api
