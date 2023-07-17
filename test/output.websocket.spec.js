const assert = require('assert')
const WebSocket = require('ws')

const websocket = require('../src/output/websocket')
const seeker = require('../test/mocks/seeker.js')

const port = 61042
const pingInterval = 500

describe('WebSockets', function () {
  describe('Defaults', function () {
    it('runs by default on port 8080', () => {
      websocket.start()
      websocket.stop()
    })
  })

  describe('Custom Config', function () {
    it('logs receives messages', (done) => {
      websocket.start({ port })
      const client = new WebSocket(`ws://127.0.0.1:${port}`)
      client.on('open', () => {
        client.send('message')
        client.close()
        websocket.stop()
        done()
      })
    })

    it('plays ping pong', (done) => {
      let pingCount = 0

      websocket.start({ port, pingInterval: 10 })

      function heartbeat () {
        clearTimeout(this.pingTimeout)

        pingCount++
        if (pingCount === 3) {
          this.close()
          websocket.stop()
          done()
        }

        this.pingTimeout = setTimeout(this.terminate, pingInterval + 10)
      }

      const client = new WebSocket(`ws://127.0.0.1:${port}`)

      client.on('open', heartbeat)
      client.on('ping', heartbeat)
      client.on('close', function clear () {
        clearTimeout(this.pingTimeout)
      })
    })

    it('sends candidates-found messages to client', (done) => {
      websocket.start({ port })
      seeker.events.on('candidate-found', websocket.broadcast)
      seeker.start(null, { targetLanguages: ['java'] })
      const client = new WebSocket(`ws://127.0.0.1:${port}`)

      client.on('message', (message) => {
        assert.deepStrictEqual(JSON.parse(message), {
          includedLangs: ['java'],
          prHtmlUrl: 'https://github.com/foo/bar/pull/1234',
          hireable: true
        })

        seeker.stop()
        websocket.stop()
        client.close()
        done()
      })
    })
  })
})
