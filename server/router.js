const authMiddleware = require('./middleware/auth.middleware')
const authNotMiddleware = require('./middleware/auth.not.middleware')
const corsMiddleware = require('./middleware/cors.middleware')
const corsAllMiddleware = require('./middleware/cors.all.middleware')
const tokenService = require('./service/token.service')
const libService = require('./service/lib.service')
const sharp = require('sharp')
const ApiException = require('./exception/api.exception')
const {body, validationResult} = require('express-validator');
const db = require('./database')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const geoip = require('geoip-lite')
const path = require('path')
const fs = require('fs')
const mailService = require('./service/mail.service')

class Longpool {
  constructor(name) {
    this.connected = []
    this.name = name
  }

  connect(id, req, res, callback) {
    // console.log(`${this.name} connect connected: ${this.connected.length}`)
    this.notify(id, "connect", callback)
  }

  disconnect(id, rid, callback) {
    this.notify(id, "disconnect", callback)
    // console.log(`${this.name} disconnect connected: ${this.connected.length}`)
  }

  notify(id, type, callback = () => {
  }) {
    switch (type) {
      case "update": {
        // console.log(`${this.name} update connected: ${this.connected.length}`)
        callback(this.connected)
        break
      }
      case "connect": {
        callback(this.connected)
        break
      }
      case "disconnect": {
        callback(this.connected)
        break
      }
    }
  }
}

global.longpoolConnection = new Longpool('longpool connection')
const saveFiles = async (files) => {
  return new Promise(async (resolve, reject) => {
    let pathForFiles = path.join(__dirname, "/static/")
    if (files.file.length) {
      const result = []
      files.file.forEach((file, index) => {
        let newFileName = `${uuid.v4()}`
        let fileType = file.name.split('.')[file.name.split('.').length - 1]
        file.mv(pathForFiles + `${newFileName}.${fileType}`, async () => {
          await sharp(pathForFiles + `${newFileName}.${fileType}`).metadata().then(async info => {
            const config = {
              jpeg: {quality: 80},
              webp: {quality: 80},
              png: {compressionLevel: 8},
            }
            await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
              width: Math.round(info.width / 3),
              height: Math.round(info.height / 3),
            }).toFile(pathForFiles + `${newFileName}.x3.${fileType}`)
            await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
              width: Math.round(info.width / 2),
              height: Math.round(info.height / 2),
            }).toFile(pathForFiles + `${newFileName}.x2.${fileType}`)
            await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
              width: Math.round(info.width / 1.2),
              height: Math.round(info.height / 1.2),
            }).toFile(pathForFiles + `${newFileName}.x1.${fileType}`)
            result.push({
              x3: `${newFileName}.x3.${fileType}`,
              x2: `${newFileName}.x2.${fileType}`,
              x1: `${newFileName}.x1.${fileType}`,
              original: `${newFileName}.${fileType}`,
            })
            if (result.length == files.file.length) {
              resolve({
                x3: `${newFileName}.x3.${fileType}`,
                x2: `${newFileName}.x2.${fileType}`,
                x1: `${newFileName}.x1.${fileType}`,
                original: `${newFileName}.${fileType}`,
              })
            }
          })
        })
      })
    } else {
      let newFileName = `${uuid.v4()}`
      let fileType = files.file.name.split('.')[files.file.name.split('.').length - 1]
      await files.file.mv(pathForFiles + `${newFileName}.${fileType}`, async () => {
        await sharp(pathForFiles + `${newFileName}.${fileType}`).metadata().then(async info => {
          const config = {
            jpeg: {quality: 80},
            webp: {quality: 80},
            png: {compressionLevel: 8},
          }
          await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
            width: Math.round(info.width / 3),
            height: Math.round(info.height / 3),
          }).toFile(pathForFiles + `${newFileName}.x3.${fileType}`)
          await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
            width: Math.round(info.width / 2),
            height: Math.round(info.height / 2),
          }).toFile(pathForFiles + `${newFileName}.x2.${fileType}`)
          await sharp(pathForFiles + `${newFileName}.${fileType}`)[info.format](config[info.format]).resize({
            width: Math.round(info.width / 1.2),
            height: Math.round(info.height / 1.2),
          }).toFile(pathForFiles + `${newFileName}.x1.${fileType}`)
          resolve({
            x3: `${newFileName}.x3.${fileType}`,
            x2: `${newFileName}.x2.${fileType}`,
            x1: `${newFileName}.x1.${fileType}`,
            original: `${newFileName}.${fileType}`,
          })
        })
      })
    }
  })
}
const isRussianPhoneNumber = (value) => {
  if (!value) return true
  const phoneNumber = value.replace(/\D/g, '');
  return /^(?:7|8)\d{10}$/.test(phoneNumber);
};

module.exports = router => {
  /**
   * @swagger
   * /api:
   *   get:
   *       description: api is working
   *       responses:
   *           '200':
   *               description: all right
   * */
  router.options('/api', corsAllMiddleware)
  router.get(`/api`, [corsAllMiddleware], (req, res, next) => {
    try {
      res.json({data: `hello world`})
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/user:
   *   post:
   *       description: Регистрация аккаунта
   *       parameters:
   *         - name: email
   *           required: true
   *           in: body
   *           type: string
   *         - name: password
   *           required: true
   *           in: body
   *           type: string
   *         - name: username
   *           required: true
   *           in: body
   *           type: string
   *         - name: phone
   *           required: true
   *           in: body
   *           type: string
   *         - name: code
   *           required: true
   *           in: body
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает access_token,refresh_token и user
   * */
  router.options('/api/user', corsAllMiddleware)
  router.post(`/api/user`, [corsAllMiddleware, authNotMiddleware, body('email').notEmpty().isEmail().normalizeEmail(), body('password').isLength({
    min: 6,
    max: 32
  }), body('phone').notEmpty().isMobilePhone().custom(isRussianPhoneNumber), body('token').notEmpty()], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      const candidate = {
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 4),
        activation_link: uuid.v4(),
        code: req.body.code,
        token: req.body.token,
        location: await bcrypt.hash(`${geoip.lookup(req.ip)?.country}/${geoip.lookup(req.ip)?.city}`, 4),
        username: req.body.username
      }
      if (await db.query(`SELECT * FROM "user_schema"."user" WHERE "email" = '${candidate.email}' OR 
        "username" = '${candidate.username}' OR "phone" = '${candidate.phone}'`).then(result => result.rowCount) > 0)
        throw ApiException.BadRequest('Пользователь уже зарегистрирован!', [])
      const script = async () => {
        const user = await db.query(`INSERT INTO "user_schema"."user" ("email","password","activation_link", "username","phone") VALUES 
      ('${candidate.email}','${candidate.password}','${candidate.activation_link}','${candidate.username}','${candidate.phone}') RETURNING *`).then(result => result.rows[0])
        mailService.sendEmail(candidate.email, `Перейдите по ссылке для активации аккаунта ${candidate.activation_link}`, "Активация аккаунта")
        delete user.password
        delete user.email
        delete user.phone
        delete user.activation_link
        delete user.created_at
        const deviceID = uuid.v4()
        const tokens = tokenService.generate({id: user.id, location: candidate.location, deviceID: deviceID})
        await tokenService.save(user.id, tokens.accessToken, tokens.refreshToken, deviceID, candidate.location)
        res.cookie('device_id', deviceID, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
        })
        res.cookie('refresh_token', tokens.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
        })
        res.set('Authorization', `Bearer ${tokens.accessToken}`)
        res.json({access_token: tokens.accessToken, refresh_token: tokens.refreshToken, user})
      }

      const hasCode = await db.query(`SELECT * FROM "user_schema"."phone_code" WHERE "phone" = '${candidate.phone}' AND "code" = '${candidate.code}' AND "activated_at" IS NOT NULL`).then(res => res.rows[0])
      if (!hasCode) {
        throw ApiException.BadRequest('Номер телефона не подтверждён!', [])
      } else {
        await script()
      }
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/user/refresh:
   *   put:
   *       description: Обновление токенов
   *       parameters:
   *         - name: refresh_token
   *           required: true
   *           in: body
   *           type: string
   *         - name: access_token
   *           required: true
   *           in: body
   *           type: string
   *         - name: device_id
   *           in: cookies
   *           required: true
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает access_token,refresh_token и user
   * */
  router.put(`/api/user/refresh`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      const accessToken = req.query.access_token || req.body.access_token || req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined
      const refreshToken = req.cookies.refresh_token
      if (!req.cookies.device_id || !refreshToken || !accessToken) {
        throw ApiException.BadRequest('Не корректные данные!')
      }
      let deviceID = req.cookies.device_id
      location = await bcrypt.hash(`${geoip.lookup(req.ip)?.country}/${geoip.lookup(req.ip)?.city}`, 4)
      if (!(await tokenService.validate(accessToken, refreshToken, deviceID, location))) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${accessToken}' AND "T"."refresh_token" = '${refreshToken}'`).then(res => res.rows[0])
      delete user.password
      delete user.email
      delete user.activation_link
      delete user.created_at
      const tokens = tokenService.generate({id: user.id, location: location, deviceID: deviceID})
      await tokenService.save(user.id, tokens.accessToken, tokens.refreshToken, deviceID, location)
      res.cookie('device_id', deviceID, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
      })
      res.cookie('refresh_token', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
      })
      res.set('Authorization', `Bearer ${tokens.accessToken}`)
      const chat = await db.query(`SELECT * FROM "message_schema"."chat" WHERE id = ${user.chat}`).then(res => res.rows[0].title)
      const folder = await db.query(`SELECT * FROM "message_schema"."folder" WHERE id = ${user.id}`).then(res => res.rows)
      const avatar = await db.query(`SELECT * FROM "message_schema"."chat_avatar" WHERE id_chat = ${user.chat} AND id_setter = ${user.id}`).then(res => res.rows)
      res.json({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user,
        chat,
        folder: folder,
        avatar: avatar
      })
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/user:
   *   delete:
   *       description: Выход из аккаунта
   *       parameters:
   *         - name: refresh_token
   *           in: cookies
   *           required: true
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает logout
   * */
  router.delete(`/api/user`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      throw ApiException.Unauthorized()
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/user:
   *   put:
   *       description: Вход в аккаунт
   *       parameters:
   *         - name: email
   *           required: true
   *           in: body
   *           type: string
   *         - name: password
   *           required: true
   *           in: body
   *           type: string
   *         - name: device_id
   *           in: cookies
   *           required: true
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает access_token,refresh_token и user
   * */
  router.put(`/api/user`, [corsAllMiddleware, authNotMiddleware, body('password').isLength({
    min: 6, max: 32
  }), body('phone').custom(isRussianPhoneNumber), body('code').notEmpty(), body('token').notEmpty()], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      let {email, password, phone, code, token} = req.body
      let user = undefined
      if (email) {
        user = await db.query(`SELECT * FROM "user_schema"."user" WHERE "email" = '${email.toLowerCase()}'`).then(res => res.rows[0])
      } else {
        user = await db.query(`SELECT * FROM "user_schema"."user" WHERE "phone" = '${phone}'`).then(res => res.rows[0])
      }
      if (!user) throw ApiException.BadRequest('Пользователь не найден!')
      phone = user.phone
      const script = async () => {
        const isPasswordEquals = await bcrypt.compare(password, user.password)
        if (!isPasswordEquals) throw ApiException.Unauthorized()
        user.location = await bcrypt.hash(`${geoip.lookup(req.ip)?.country}/${geoip.lookup(req.ip)?.city}`, 4)
        let deviceID = uuid.v4()
        if (req.cookies.device_id) {
          deviceID = req.cookies.device_id
        }
        delete user.password
        delete user.email
        delete user.activation_link
        delete user.created_at
        delete user.location
        delete user.phone
        const tokens = tokenService.generate({id: user.id, location: user.location, deviceID: deviceID})
        await tokenService.save(user.id, tokens.accessToken, tokens.refreshToken, deviceID, user.location)
        res.cookie('device_id', deviceID, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
        })
        res.cookie('refresh_token', tokens.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV ? process.env.NODE_ENV == "production" : false
        })
        res.set('Authorization', `Bearer ${tokens.accessToken}`)
        res.json({access_token: tokens.accessToken, refresh_token: tokens.refreshToken, user})
      }
      if (phone) {
        const hasCode = await db.query(`SELECT * FROM "user_schema"."phone_code" WHERE "phone" = '${phone}' AND "code" = '${code}' AND "activated_at" IS NOT NULL`).then(res => res.rows[0])
        if (!hasCode) {
          throw ApiException.BadRequest('Номер телефона не подтверждён!', [])
        } else {
          await script()
        }
      } else {
        await script()
      }
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/user:
   *   get:
   *       description: Данные о себе
   *       parameters:
   *         - name: access_token
   *           required: true
   *           in: headers
   *           type: string
   *         - name: refresh_token
   *           required: true
   *           in: cookies
   *           type: string
   *         - name: device_id
   *           in: cookies
   *           required: true
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает user
   * */
  router.get(`/api/user`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' 
      AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      delete user.password
      delete user.email
      delete user.activation_link
      delete user.created_at
      delete user.location
      const chat = await db.query(`SELECT * FROM "message_schema"."chat" WHERE id = ${user.chat}`).then(res => res.rows[0].title)
      const folder = await db.query(`SELECT * FROM "message_schema"."folder" WHERE id = ${user.id}`).then(res => res.rows)
      const avatar = await db.query(`SELECT * FROM "message_schema"."chat_avatar" WHERE id_chat = ${user.chat} AND id_setter = ${user.id}`).then(res => res.rows)
      res.json({user, chat, folder: folder, avatar: avatar})
    } catch (e) {
      next(e)
    }
  })
  router.get(`/api/chat`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' 
      AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      const folder = req.query.folder ? req.query.folder == 0 ? "NULL" : req.query.folder : "NULL"
      const page = req.query.page || 0
      let chats = await db.query(`SELECT * FROM view_get_chats_by_folder(${folder},${user.id}) ORDER BY "last_message_created" DESC OFFSET ${page} LIMIT 30`).then(res => res.rows)
      res.json({chats, page, folder: folder == "NULL" ? 0 : folder})
    } catch (e) {
      next(e)
    }
  })
  router.get(`/api/messages/:id`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' 
      AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      const page = req.query.page || 0
      let messages = await db.query(`SELECT * FROM view_messages_from_chat(${req.params.id}) WHERE "id_chat_from" = ${user.chat} OR "id_chat_to" = ${user.chat} ORDER BY "created_at" DESC OFFSET ${page} LIMIT 200`).then(res => res.rows)
      res.json({messages, page})
    } catch (e) {
      next(e)
    }
  })
  router.post(`/api/messages/:id`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' 
      AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      let messages = await db.query(`INSERT INTO "message_schema"."message" ("id_chat_from","id_chat_to","content") VALUES (${user.chat},${req.params.id},'${req.body.content}') RETURNING *`).then(res => res.rows)
      global.longpoolConnection.connected.forEach((item,index)=>{
        item.res.json({event:'update'})
        global.longpoolConnection.connected.splice(index, 1)
      })
      res.json({messages})
    } catch (e) {
      next(e)
    }
  })
  router.get('/api/user/search', [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let users = await db.query(`SELECT * FROM "user_schema"."user" AS "U" INNER JOIN "message_schema"."chat" AS "C" 
      ON "U"."chat" = "C"."id" WHERE "U"."username" LIKE '%${req.query.text}%' OR "C"."title" LIKE '%${req.query.text}%'`).then(res => res.rows)
      res.json({users})
    } catch (e) {
      next(e)
    }
  })
  router.get('/api/user/callinfo/:id', [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let callinfo = await db.query(`SELECT "C".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" INNER JOIN "user_schema"."connection" AS "C" ON "C"."id_token" = "T"."id"
 WHERE "C"."peer" IS NOT NULL AND "C"."peer" != '' AND "U"."id" = ${req.params.id}`).then(res => res.rows)
      res.json({callinfo})
    } catch (e) {
      next(e)
    }
  })
  router.post(`/api/upload`, [corsMiddleware], async (req, res) => {
    res.json(await saveFiles(req.files))
  })
  /**
   * @swagger
   * /api/utils/check_phone:
   *   post:
   *       description: Проверка телефона посредством смс кода
   *       parameters:
   *         - name: phone
   *           required: true
   *           in: body
   *           type: string
   *         - name: token
   *           required: true
   *           in: body
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает passed
   * */
  router.options('/api/utils', corsAllMiddleware)
  router.post(`/api/utils/check_phone`, [corsAllMiddleware, authNotMiddleware, body('token').notEmpty(), body('phone').custom(isRussianPhoneNumber)], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      let {phone, email, token} = req.body
      let code = 0
      if (!!email && email != "") {
        phone = await db.query(`SELECT * FROM "user_schema"."user" WHERE "email" = '${email.toLowerCase()}'`).then(res => res.rows[0].phone)
      }
      const checkIsCodeExists = async () => {
        code = Math.floor(Math.random() * (999999 - 100000) + 100000)
        const hasCode = await db.query(`SELECT * FROM "user_schema"."phone_code" WHERE "phone" = '${phone}' AND "code" = '${code}' AND "created_at" >= NOW() - INTERVAL '8 hours'`).then(res => res.rows[0])
        if (!hasCode) {
          return code
        } else {
          return await checkIsCodeExists()
        }
      }
      await checkIsCodeExists()
      if ("nocaptcha" in req.query) {
        db.query(`INSERT INTO "user_schema"."phone_code" ("phone","code") VALUES ('${phone}','${code}')`).then(() => {
          if ("nocode" in req.query) {
            res.json({passed: true, code})
          } else {
            libService.send_sms_code(code, phone, () => {
              res.json({passed: true})
            })
          }
        })
      } else {
        libService.check_captcha(token, req.ip, (passed) => {
          if (passed) {
            db.query(`INSERT INTO "user_schema"."phone_code" ("phone","code") VALUES ('${phone}','${code}')`).then(() => {
              if ("nocode" in req.query) {
                res.json({passed: true, code})
              } else {
                libService.send_sms_code(code, phone, () => {
                  res.json({passed: true})
                })
              }
            })
          } else {
            res.json({passed})
          }
        })
      }
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/utils/check_code:
   *   post:
   *       description: Проверка смс кода
   *       parameters:
   *         - name: phone
   *           required: true
   *           in: body
   *           type: string
   *         - name: token
   *           required: true
   *           in: body
   *           type: string
   *         - name: code
   *           required: true
   *           in: body
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает passed
   * */
  router.post(`/api/utils/check_code`, [corsAllMiddleware, authNotMiddleware, body('token').notEmpty(), body('code').notEmpty(), body('phone').custom(isRussianPhoneNumber)], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      let {phone, code, token, email} = req.body
      if (!!email && email != "") {
        phone = await db.query(`SELECT * FROM "user_schema"."user" WHERE "email" = '${email.toLowerCase()}'`).then(res => res.rows[0].phone)
      }
      const hasCode = await db.query(`SELECT * FROM "user_schema"."phone_code" WHERE "phone" = '${phone}' AND "code" = '${code}' AND "activated_at" IS NULL`).then(res => res.rows[0])
      if (!hasCode) {
        res.json({passed: false})
      } else {
        db.query(`UPDATE "user_schema"."phone_code" SET "activated_at" = CURRENT_TIMESTAMP(3)::TIMESTAMP WHERE "phone" = '${phone}' AND "code" = '${code}'`).then(() => {
          res.json({passed: true})
        })
      }
    } catch (e) {
      next(e)
    }
  })
  /**
   * @swagger
   * /api/utils/check_code:
   *   post:
   *       description: Отправка сообщения активации почты
   *       parameters:
   *         - name: access_token
   *           required: true
   *           in: body
   *           type: string
   *         - name: refresh_token
   *           required: true
   *           in: body
   *           type: string
   *       responses:
   *           '200':
   *               description: возвращает sended
   * */
  router.post(`/api/utils/send_activation_link`, [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      if (!user.is_activated) {
        mailService.sendEmail(user.email, `Перейдите по ссылке для активации аккаунта /?eal=${user.activation_link}`, "Активация аккаунта")
        res.json({sended: true})
      } else {
        res.json({sended: false})
      }
    } catch (e) {
      next(e)
    }
  })
  router.get(`/api/user/activate/:link`, [corsAllMiddleware], async (req, res, next) => {
    try {
      if (req.params.link.length == 36) {
        const user = await db.query(`SELECT * FROM "user_schema"."user" WHERE "activation_link" = '${req.params.link}'`).then(res => res.rows[0])
        if (!user.is_activated) {
          await db.query(`UPDATE "user_schema"."user" SET "is_activated" = TRUE WHERE "activation_link" = '${req.params.link}'`).then(res => res.rows[0])
          res.json({activated: true})
        } else {
          res.json({activated: false})
        }
      } else {
        res.json({activated: false})
        return
      }
    } catch (e) {
      next(e)
    }
  })
  router.get('/api/utils/connection', [corsAllMiddleware, authMiddleware], async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw ApiException.BadRequest('Не корректные данные!', errors.array())
      let access_token = req.query.access_token || req.body.access_token || req.headers.authorization
        ? req.headers.authorization.split(' ')[1] : undefined
      let refresh_token = req.query.refresh_token || req.body.refresh_token || req.cookies.refresh_token
      if (!access_token && !refresh_token) throw ApiException.Unauthorized()
      let user = await db.query(`SELECT "U".* FROM "user_schema"."user" AS "U" INNER JOIN "user_schema"."token" AS "T" 
      ON "U"."id" = "T"."id_user" WHERE "T"."access_token" = '${access_token}' AND "T"."refresh_token" = '${refresh_token}'`).then(res => res.rows[0])
      if(user){

        global.longpoolConnection.connect(user.id,req,res,(connections)=>{
          if(req.query.type != 'reload'){
            global.longpoolConnection.connected.push({id:user.id,rid:req.rid,req,res})
            global.longpoolConnection.connected.forEach((item,index)=>{
              // console.log(global.longpoolConnection.connected,item.id)
              if(item.rid != req.rid){
                item.res.json({event:'update'})
                global.longpoolConnection.connected.splice(index, 1)
              }
            })
          }else{
            global.longpoolConnection.connected.forEach((item,index)=>{
              if(item.id == user.id){
                item.res.json({event:'update'})
                global.longpoolConnection.connected.splice(index, 1)
              }
            })
          }
        })
        console.log('connect',user.id,global.longpoolConnection.connected.length)
        req.removeListener('close',()=>{
          console.log('close2')
        })
        // req.on('close', async () => {
        //   console.log('close',user.id)
        //   // global.longpoolConnection.disconnect(user.id,req.rid,(connections)=>{
        //   //   global.longpoolConnection.connected.forEach((item,index)=>{
        //   //     if(item.rid == req.rid){
        //   //       console.log("disconnected",item.id)
        //   //       global.longpoolConnection.connected.splice(index, 1)
        //   //     }
        //   //   })
        //   // })
        // })
        // req.on('end', async () => {
        //   console.log('end',user.id)
        // })
        // req.on('abort', async () => {
        //   console.log('abort',user.id)
        // })
        // req.on('error', async () => {
        //   console.log('error',user.id)
        // })
      }
    } catch (e) {
      next(e)
    }
  })
}
