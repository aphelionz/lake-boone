const assert = require('assert')
const seeker = require('../src/seeker')
require('./mocks/github-api')

describe('Seeker', function () {
  describe('Events', function () {
    it('emits the metrics event', (done) => {
      seeker.events.on('metrics', function cb (metrics) {
        assert.strictEqual(metrics.uniqueEvents, 3)
        assert.strictEqual(metrics.prEvents, 3)
        assert.strictEqual(metrics.suitablePRs, 3)
        assert.strictEqual(metrics.missIncludedLangs, 1)
        assert.strictEqual(metrics.missNonHireable, 1)
        assert.strictEqual(metrics.candidatesFound, 1)
        seeker.stop()
        done()
      })
      seeker.start('', { targetLanguages: ['java'] })
    })

    it('emits the candidate-found event', (done) => {
      seeker.stop()
      seeker.events.on('candidate-found', function cb (candidate) {
        assert.deepStrictEqual(candidate, {
          hireable: true,
          includedLangs: ['java'],
          prHtmlUrl: 'https://github.com/foo/bar/pull/1234'
        })
        seeker.events.off('candidate-found', cb)
        seeker.stop()
        done()
      })
      seeker.start(null, { targetLanguages: ['java'] })
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
