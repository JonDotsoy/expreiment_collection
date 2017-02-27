const url = require('url')
const cluster = require('cluster')
const config = require('../config')
const express = require('express')

require('../app/connect').shim()

const processSend = function () {
  process && process.send && process.send.apply(process, arguments)
}

const app = express()

app.locals.body = {}

app.set('view engine', 'pug')
app.set('views', 'resources/view')

app.use(express.static('www'))
app.use('/img/icons', express.static('resources/img/icons'))

const homeCtrl = require('../app/controller/collection')

app.use(homeCtrl.path, homeCtrl.route)

// API

const toHostname = (address) => address === '::'
  ? 'localhost'
  : address === '0.0.0.0'
    ? 'localhost'
    : address

const server = app.listen((config.port || 3000, config.address || '::'), () => {
  const {port, address} = server.address()
  const defaultURL = url.format({
    protocol: 'http',
    port,
    hostname: toHostname(address)
  })

  console.info('open server Open %s', defaultURL)

  processSend({
    type: 'LISTEN_SERVER',
    port,
    address,
    defaultURL
  })
})

if (cluster.isWorker) {
  cluster.worker.on('message', ({type}) => {
    if (type === 'CLOSE_SERVER') {
      server.close()

      processSend({type: 'CLOSING_WORKER'})

      process.nextTick(() => {
        process.exit(0)
      })
    }
  })
}

