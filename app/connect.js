
const redis = require('redis')
const config = require('../config')

class Connect {
  constructor ({host, port} = {}) {
    this.con = redis.createClient({
      host,
      port
    })

    this.con.on('error', console.log)
  }

  get connection () {
    return this.con
  }

  async get (key) {
    return new Promise((resolve, reject) => {
      this.con.get(key, (err, result) => {
        if (err) { reject(err) } else { resolve(result) }
      })
    })
  }

  async set (key, value) {
    return new Promise((resolve, reject) => {
      this.con.set(key, value, (err, result) => {
        if (err) { reject(err) } else { resolve(result === 'OK') }
      })
    })
  }

  async keys () {
    return new Promise((resolve, reject) => {
      this.con.keys('*', (err, keys) => {
        if (err) { reject(err) } else { resolve(keys) }
      })
    })
  }

  async forEach (fn) {
    const keys = await this.keys()

    for (var i = 0; i < keys.length; i++) {
      await fn(await this.get(keys[i]), keys[i])
    }
  }

  async has (key) {
    return new Promise((resolve, reject) => {
      this.con.exists(key, (err, result) => {
        if (err) { reject(err) } else { resolve(result) }
      })
    })
  }
}

function shim () {
  if (!global.connect && global.connect instanceof Connect) {
    // Local instance to connect
    global.connect = new Connect({host: config.db.host, port: config.db.port})
  }
}

exports = module.exports = {

  __esModule: true,

  default: Connect,
  Connect,
  shim

}

