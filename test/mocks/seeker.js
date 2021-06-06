const EventEmitter = require('events')

const events = new EventEmitter()

const mockInterval = setInterval(() => {
  events.emit('candidate-found', {
    hireable: true,
    includedLangs: ['java'],
    prHtmlUrl: 'https://github.com/foo/bar/pull/1234'
  })
}, 20)

module.exports = {
  start: () => {},
  events,
  stop: () => {
    clearInterval(mockInterval)
    events.removeAllListeners()
  }
}
