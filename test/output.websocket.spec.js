require('./fixtures/github-api')

const assert = require('assert')
const nock = require('nock')
const WebSocket = require('ws')

const websocket = require('../src/output/websocket')
const seeker = require('../src/seeker')

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
    before(() => {
      websocket.start({ port, pingInterval })
      seeker.events.on('candidate-found', websocket.broadcast)
    })

    beforeEach(() => {
      seeker.stop()
      seeker.start(null, { targetLanguages: ['java'] })
    })

    after(() => {
      seeker.events.removeAllListeners()
      websocket.stop()
      seeker.stop()
    })

    it('logs receives messages', () => {
      const client = new WebSocket(`http://127.0.0.1:${port}`)
      setTimeout(() => client.send('message'), 500)
      setTimeout(() => client.close(), 700)
    })

    it('plays ping pong', (done) => {
      let pingCount = 0

      function heartbeat () {
        clearTimeout(this.pingTimeout)

        pingCount++
        if (pingCount === 3) {
          this.close()
          done()
        }

        this.pingTimeout = setTimeout(this.terminate, pingInterval + 50)
      }

      const client = new WebSocket(`http://127.0.0.1:${port}`)

      client.on('open', heartbeat)
      client.on('ping', heartbeat)
      client.on('close', function clear () {
        clearTimeout(this.pingTimeout)
      })
    })

    it('sends candidates-found messages to client', (done) => {
      nock.enableNetConnect()
      const client = new WebSocket(`http://127.0.0.1:${port}`)
      client.on('message', (message) => {
        assert.deepStrictEqual(JSON.parse(message), {
          includedLangs: ['java'],
          prHtmlUrl: 'https://github.com/foo/bar/pull/1234',
          hireable: true
        })
        client.close()
        done()
      })
    })
  })
})
