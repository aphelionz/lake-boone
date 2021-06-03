const assert = require('assert')
const seeker = require('../src/seeker')
const { events } = require('../src/seeker')
const nock = require('nock')

const prScope = nock('https://api.github.com')
  .persist()
  .get('/foo/bar/languages')
  .reply(200, {
    Java: 2000
  })

const userScope = nock('https://api.github.com')
  .persist()
  .get('/users/human')
  .reply(200, {
    hireable: true
  })

describe('Seeker', function() {
  after(() => {
    seeker.stop()
  })

  it('emits the _debug.rawEvents event', (done) => {
    const scope = nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200, [{}, {}, {}, {}])

    seeker.start()
    events.on('_debug.rawEvents', function cb(eventCount) {
      assert.strictEqual(eventCount, 4)
      done()
      events.off('_debug.rawEvents', cb)
    })
    seeker.stop()
  })

  it('emits the _debug.cursorUpdated event', (done) => {
    const scope = nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200, [{ id: 2 }])

    seeker.start()
    events.on('_debug.cursorUpdated', function cb(cursor) {
      assert.strictEqual(cursor, 2)
      done()
      events.off('_debug.cursorUpdated', cb)
    })
    seeker.stop()
  })

  it('emits the _debug.firstFilter event', (done) => {
    const scope = nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200,[{
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
              login: 'human'
            },
            html_url: 'https://github.com/foo/bar/pull/1234',
            url: 'https://api.github.com/foo/bar/pulls'
          }
        }
      }])

    seeker.start(null, { targetLanguages: ['java'] })
    events.on('_debug.filteredEvents', function cb (filteredEvents) {
      assert.strictEqual(filteredEvents, 1)
      events.off('_debug.filteredEvents', cb)
      done()
    })
    seeker.stop()
  })

  it('emits the candidateFound event', (done) => {
    const scope = nock('https://api.github.com')
      .get('/events?per_page=100')
      .reply(200,[{
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
        hireable: true
      })
      events.off('candidateFound', cb)
      done()
    })
    seeker.stop()
  })
})
