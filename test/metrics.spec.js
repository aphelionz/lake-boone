const assert = require('assert')
const http = require('http');

const { metrics, start, stop } = require('../src/metrics')
const port = 63429

describe("Metrics", function() {
  before(async () => {
    await start({ port })
  })

  it(`displays Prometheus-compatible metrics on random port ${port}`, (done) => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      assert.strictEqual(res.statusCode, 200)
      res.on('data', function (chunk) {
        const body = chunk.toString()

        // Let's just check for a few at random for now
        assert.match(body, /process_cpu_user_seconds_total/)
        assert.match(body, /process_virtual_memory_bytes/)
        assert.match(body, /process_open_fds/)
        assert.match(body, /nodejs_eventloop_lag_stddev_seconds/)

        // Does it include our custom metrics as well?
        assert.match(body, /candidates_found{app=\"cerebro\"}/)
        done()
      })
    })
  })

  it(`exports custom metrics in the module.exports.metrics array`, () => {
    assert.strictEqual(metrics.length, 1)
  })

  after(async () => {
    await stop()
  })
})
