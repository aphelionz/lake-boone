const assert = require('assert')
const seeker = require('../src/seeker')
const { events } = require('../src/seeker')
const nock = require('nock')

nock('https://api.github.com')
  .persist()
  .get('/foo/bar/languages')
  .reply(200, {
    Java: 2000
  })

nock('https://api.github.com')
  .persist()
  .get('/users/human')
  .reply(200, {
    hireable: true
  })

describe('Seeker', function () {
  after(() => {
    seeker.stop()
  })

  it('emits the _debug.rawEvents event', (done) => {
    nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])

    seeker.start()
    events.on('_debug.uniqueEvents', function cb (eventCount) {
      assert.strictEqual(eventCount, 4)
      done()
      events.off('_debug.uniqueEvents', cb)
    })
    seeker.stop()
  })

  it('emits the _debug.suitablePRs event', (done) => {
    nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200, [{
        id: 5,
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
      }])

    seeker.start(null, { targetLanguages: ['java'] })
    events.on('_debug.suitablePRs', function cb (count) {
      assert.strictEqual(count, 1)
      done()
      events.off('_debug.suitablePRs', cb)
    })
    seeker.stop()
  })

  it('emits the candidateFound event', (done) => {
    nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200, [{
        id: 6,
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
      }])

    seeker.start(null, { targetLanguages: ['java'] })
    events.on('candidateFound', function cb (candidate) {
      assert.deepStrictEqual(candidate, {
        hireable: true,
        includedLangs: ['java'],
        prHtmlUrl: 'https://github.com/foo/bar/pull/1234'
      })
      events.off('candidateFound', cb)
      done()
    })
    seeker.stop()
  })
})
