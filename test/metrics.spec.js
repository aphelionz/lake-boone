const assert = require('assert')
const http = require('http')

const metrics = require('../src/metrics')
const port = 63429

describe('Metrics', function () {
  describe('Defaults', function () {
    it('starts on default port 3000', () => {
      metrics.start()
      metrics.stop()
    })
  })

  describe('Custom Config', function () {
    before(() => {
      metrics.start({ port })
    })

    it(`displays Prometheus-compatible metrics on random port ${port}`, (done) => {
      http.get(`http://127.0.0.1:${port}`, (res) => {
        assert.strictEqual(res.statusCode, 200)
        res.on('data', function (chunk) {
          const body = chunk.toString()

          // Let's just check for a few at random for now
          assert.match(body, /process_cpu_user_seconds_total/)
          assert.match(body, /process_virtual_memory_bytes/)
          assert.match(body, /process_open_fds/)
          assert.match(body, /nodejs_eventloop_lag_stddev_seconds/)

          // Does it include our custom metrics as well?
          assert.match(body, /candidates_found/)
          assert.match(body, /unique_events_processed{app="cerebro"}/)
          assert.match(body, /suitable_pull_requests_found{app="cerebro"}/)
          done()
        })
      })
    })

    it('exports custom metrics in the module.exports.metrics array', () => {
      assert(metrics.custom.candidatesFound)
      assert(metrics.custom.uniqueEvents)
      assert(metrics.custom.pullRequests)
      assert(metrics.custom.missNonHireable)
      assert(metrics.custom.missIncludedLangs)
      assert(metrics.custom.suitablePRs)
    })

    it('shows language-specific metrics with Prometheus labels', () => {
      metrics.custom.candidatesFound.labels({ lang: 'go' }).inc(1)
      metrics.custom.candidatesFound.labels({ lang: 'java' }).inc(2)
      metrics.custom.candidatesFound.labels({ lang: 'rust' }).inc(3)

      http.get(`http://127.0.0.1:${port}`, (res) => {
        assert.strictEqual(res.statusCode, 200)
        res.on('data', function (chunk) {
          const body = chunk.toString()
          assert.match(body, /candidates_found{lang="go",app="cerebro"} 1/)
          assert.match(body, /candidates_found{lang="java",app="cerebro"} 2/)
          assert.match(body, /candidates_found{lang="rust",app="cerebro"} 3/)
        })
      })
    })

    after(() => {
      metrics.stop()
    })
  })
})
