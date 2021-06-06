const assert = require('assert')
const seeker = require('../src/seeker')
const { events } = require('../src/seeker')
require('./fixtures/github-api')

describe('Seeker', function () {
  describe('Events', function () {
    it('emits the metrics event', (done) => {
      events.on('metrics', function cb (metrics) {
        assert.strictEqual(metrics.uniqueEvents, 3)
        assert.strictEqual(metrics.prEvents, 3)
        assert.strictEqual(metrics.suitablePRs, 3)
        assert.strictEqual(metrics.missIncludedLangs, 1)
        assert.strictEqual(metrics.missNonHireable, 1)
        done()
        events.off('metrics', cb)
      })
      seeker.start('', { targetLanguages: ['java'] })
      seeker.stop()
    })

    it('emits the candidate-found event', (done) => {
      seeker.start(null, { targetLanguages: ['java'] })
      events.on('candidate-found', function cb (candidate) {
        assert.deepStrictEqual(candidate, {
          hireable: true,
          includedLangs: ['java'],
          prHtmlUrl: 'https://github.com/foo/bar/pull/1234'
        })
        events.off('candidate-found', cb)
        done()
      })
      seeker.stop()
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
