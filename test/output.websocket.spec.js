require('./fixtures/github-api')

const assert = require('assert')
const nock = require('nock')
const WebSocket = require('ws')

const websocket = require('../src/output/websocket')
const seeker = require('../src/seeker')

const port = 61042
const pingInterval = 500

describe('Output', function () {
  describe('Websockets', function () {
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

    it('plays ping pong', (done) => {
      function heartbeat () {
        this.send('')
        clearTimeout(this.pingTimeout)

        this.pingTimeout = setTimeout(() => {
          this.terminate()
        }, pingInterval + 50)
      }

      const client = new WebSocket(`http://127.0.0.1:${port}`)
      const client2 = new WebSocket(`http://127.0.0.1:${port}`)
      setTimeout(() => {
        client2.terminate()
      }, pingInterval / 2)

      client.on('open', heartbeat)
      client.on('ping', () => done())
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
