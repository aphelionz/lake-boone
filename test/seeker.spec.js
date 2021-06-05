const assert = require('assert')
const seeker = require('../src/seeker')
const { events } = require('../src/seeker')
const nock = require('nock')

/* Mock HTTP fixtures */
nock('https://api.github.com')
  .persist()
  .get('/events?per_page=100')
  .reply(200, [
    {
      id: 1,
      type: 'PullRequestEvent',
      payload: {
        action: 'closed',
        pull_request: {
          merged: true,
          review_comments: 3,
          additions: 10,
          deletions: 10,
          user: {
            login: 'human'
          },
          html_url: 'https://github.com/foo/bar/pull/1234',
          url: 'https://api.github.com/foo/bar/pulls'
        }
      }
    },
    {
      id: 2,
      type: 'PullRequestEvent',
      payload: {
        action: 'closed',
        pull_request: {
          merged: true,
          review_comments: 3,
          additions: 10,
          deletions: 10,
          user: {
            login: 'non-hireable-human'
          },
          html_url: 'https://github.com/foo/bar/pull/1234',
          url: 'https://api.github.com/foo/bar/pulls'
        }
      }
    },
    {
      id: 3,
      type: 'PullRequestEvent',
      payload: {
        action: 'closed',
        pull_request: {
          merged: true,
          review_comments: 3,
          additions: 10,
          deletions: 10,
          user: {
            login: 'non-hireable-human'
          },
          html_url: 'https://github.com/foo/cup/pull/1234',
          url: 'https://api.github.com/foo/cup/pulls'
        }
      }
    }
  ])

nock('https://api.github.com')
  .persist()
  .get('/foo/bar/languages')
  .reply(200, {
    Java: 2000
  })

nock('https://api.github.com')
  .persist()
  .get('/foo/cup/languages')
  .reply(200, {
    'C++': 2000
  })

nock('https://api.github.com')
  .persist()
  .get('/users/human')
  .reply(200, {
    hireable: true
  })

nock('https://api.github.com')
  .persist()
  .get('/users/non-hireable-human')
  .reply(200, {
    hireable: false
  })

describe('Seeker', function () {
  describe('Events', function () {
    beforeEach(() => {
      seeker.start('', { targetLanguages: ['java'] })
    })

    afterEach(() => {
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
