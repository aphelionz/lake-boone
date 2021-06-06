const WebSocket = require('ws')

let wss
let serverInterval

function start ({ port = 8080, pingInterval = 30000 } = {}) {
  wss = new WebSocket.Server({ port })
  console.log(`Websocket server running at http://127.0.0.1:${port}`)

  serverInterval = setInterval((function ping () {
    wss.clients.forEach(client => {
      console.log(client.isAlive)
      if (client.isAlive === false) return client.terminate()

      client.isAlive = false
      client.ping(() => {})
    })

    return ping
  })(), pingInterval)

  wss.on('connection', function connection (ws, req) {
    ws.isAlive = true
    ws.on('pong', function () { this.isAlive = true })
    const remoteIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log(`Client connected from ${remoteIP}`)

    ws.on('message', function incoming (message, req) {
      console.log('received: %s', message)
    })
  })
}

function stop () {
  clearInterval(serverInterval)
  wss.close()
}

function broadcast (payload) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload))
    }
  })
}

module.exports = {
  start,
  stop,
  broadcast
}
