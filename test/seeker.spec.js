const assert = require('assert')
const seeker = require('../src/seeker')
const { events } = require('../src/seeker')
require('./fixtures/github-api')

describe('Seeker', function () {
  describe('Events', function () {
    beforeEach(() => {
      seeker.stop()
      seeker.start(null, { targetLanguages: ['java'] })
    })

    after(() => {
      seeker.stop()
    })

    it('emits the stats-unique-events event', (done) => {
      events.on('stats-unique-events', function cb (eventCount) {
        assert.strictEqual(eventCount, 3)
        done()
        events.off('stats-unique-events', cb)
      })
    })

    it('emits the stats-pull-requests event', (done) => {
      events.on('stats-pull-requests', function cb (prCount) {
        assert.strictEqual(prCount, 3)
        done()
        events.off('stats-pull-requests', cb)
      })
    })

    it('emits the stats-suitable-prs event', (done) => {
      events.on('stats-suitable-prs', function cb (count) {
        assert.strictEqual(count, 3)
        done()
        events.off('stats-suitable-prs', cb)
      })
    })

    it('emits the candidate-found event', (done) => {
      events.on('candidate-found', function cb (candidate) {
        assert.deepStrictEqual(candidate, {
          hireable: true,
          includedLangs: ['java'],
          prHtmlUrl: 'https://github.com/foo/bar/pull/1234'
        })
        events.off('candidate-found', cb)
        done()
      })
    })

    it('emits the miss-non-hireable event', (done) => {
      events.on('miss-non-hireable', function cb (candidate) {
        events.off('miss-non-hireable', cb)
        done()
      })
    })

    it('emits the miss-included-langs event', (done) => {
      events.on('miss-included-langs', function cb (candidate) {
        events.off('miss-included-langs', cb)
        done()
      })
    })
  })

  describe('Start and Stop', function () {
    it('starts with non-null auth', function (done) {
      seeker.start('non-null', { targetLanguages: ['java'] })
      seeker.stop()
      done()
    })
  })
})
