const client = require('prom-client')
const http = require('http')

let server

const register = new client.Registry()
const candidatesFound = new client.Counter({
  name: 'candidates_found',
  help: 'Count of candidates found by Cerebro so far',
});
client.collectDefaultMetrics({ register })
register.setDefaultLabels({ app: 'cerebro' })
register.registerMetric(candidatesFound)

function start({ port = 9100 }) {
  server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', register.contentType)
    let metrics = await register.metrics()
    res.end(metrics)
  })

  server.listen(port)
  console.log(`Metrics running at http://127.0.0.1:${port}`)
}

function stop() {
  server.close()
}

module.exports = {
  custom: { candidatesFound },
  start,
  stop
}
