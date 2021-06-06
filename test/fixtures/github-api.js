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
