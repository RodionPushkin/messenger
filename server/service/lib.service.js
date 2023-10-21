const p = require('path');
const PythonShell = require('python-shell').PythonShell;
const https = require('https'),
  querystring = require('querystring');
const SMARTCAPTCHA_SERVER_KEY = "ysc2_UgrBrdOVGUamKwbke1zwMZZfmc4cMFcuHfajoQUA513660b9";
class lib {
  async ExecutePython(path = '', data) {
    let options = {
      mode: 'text',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: p.join(__dirname, "../python/"),
      args: [data]
    };
    let runPy =  new Promise( (success, nosuccess) =>{
      PythonShell.run(`${path}.py`, options, async function (err, results) {
        if (err){
          nosuccess(err)
        }else{
          success(results)
        }
      });
    })
    return await runPy.then((res) => {
      return res.toString('utf8')
    }).catch((err) => {
      return "error of execution"
      console.log(err.toString('utf8'))
    })
  }
  check_captcha(token, ip, callback) {
    const options = {
      hostname: 'smartcaptcha.yandexcloud.net',
      port: 443,
      path: '/validate?' + querystring.stringify({
        secret: SMARTCAPTCHA_SERVER_KEY,
        token: token,
        ip: ip,
      }),
      method: 'GET',
    };
    const req = https.request(options, (res) => {
      res.on('data', (content) => {
        if (res.statusCode !== 200) {
          console.error(`Allow access due to an error: code=${res.statusCode}; message=${content}`);
          callback(true);
          return;
        }
        callback(JSON.parse(content).status === 'ok');
      });
    });
    req.on('error', (error) => {
      console.error(error);
      callback(true);
    });
    req.end();
  }
  send_sms_code(code, phone, callback) {
    // const url = {
    //   api_id: "E2946056-E74B-1C45-CA3C-0FE46B3C9890",
    //   json: 1,
    // }
    // url["to["+phone+"]"] = `${code} - ваш код подтверждения телефона/входа videochat`
    // const options = {
    //   hostname: 'sms.ru',
    //   port: 443,
    //   path: '/sms/send?' + querystring.stringify(url),
    //   method: 'GET',
    // };
    const options = {
      hostname: 'ssl.bs00.ru',
      port: 443,
      path: '/?' + querystring.stringify({
        method: "push_msg",
        phone: phone,
        sender_name: "rodionpush",
        key: "4UgYaL8xz06teiMCN3z64835eeba443a451c94f456e2d00f46fd8aef6db1a893",
        format: "json",
        text: `${code} - ваш код подтверждения телефона/входа videochat`
      }),
      method: 'GET',
    };
    const req = https.request(options, (res) => {
      res.on('data', (content) => {
        if (res.statusCode !== 200) {
          console.error(`Allow access due to an error: code=${res.statusCode}; message=${content}`);
          callback(true);
          return;
        }
        callback(JSON.parse(content).status === 'ok');
      });
    });
    req.on('error', (error) => {
      console.error(error);
      callback(true);
    });
    req.end();
  }
}

module.exports = new lib()

