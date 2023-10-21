const db = require('../database')
const tokenService = require('./token.service')

class ConnectionService {
  async connect(access_token,peer) {
    let data = await tokenService.validateAccessToken(access_token)
    if (data) {
      let token = (await db.query(`SELECT * FROM "user_schema"."token" WHERE "id_user" = ${data.id} AND "access_token" = '${access_token}'`)).rows[0]
      if(token){
        db.query(`SELECT * FROM "user_schema"."connection" WHERE "id_token" = ${token.id}`).then(res => res.rows).then(async rows => {
          if(rows.length == 0){
            await db.query(`INSERT INTO "user_schema"."connection" ("id_token","peer") VALUES (${token.id},'${peer}')`)
          }else{
            await db.query(`UPDATE "user_schema"."connection" SET "peer" = '${peer}' WHERE "id_token" = ${token.id}`)
          }
        })
      }
    }
  }

  async disconnect(access_token,peer) {
    let data = await tokenService.validateAccessToken(access_token)
    if (data) {
      let token = (await db.query(`SELECT * FROM "user_schema"."token" WHERE "id_user" = ${data.id} AND "access_token" = '${access_token}'`)).rows[0]
      if(token){
        db.query(`SELECT * FROM "user_schema"."connection" WHERE "id_token" = ${token.id} AND "peer" = '${peer}'`).then(res => res.rows).then(async rows => {
          if(rows.length != 0){
            await db.query(`UPDATE "user_schema"."connection" SET "peer" = '' WHERE "id_token" = ${token.id}`)
          }else{
            // await db.query(`DELETE FROM "user_schema"."connection" WHERE "id_token" = ${token.id} AND "peer" = '${peer}'`)
          }
        })
      }
    }
  }
}

module.exports = new ConnectionService()