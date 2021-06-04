const client = require('prom-client')
const http = require('http')

let server

const register = new client.Registry()
register.setDefaultLabels({ app: 'cerebro' })
client.collectDefaultMetrics({ register })

const uniqueEventsProcessed = new client.Counter({
  name: 'unique_events_processed',
  help: 'Number of unique events processed by Cerebro'
})
register.registerMetric(uniqueEventsProcessed)
const suitablePRs = new client.Counter({
  name: 'suitable_pull_requests_found',
  help: 'Number of suitable pull requests by Cerebro'
})
register.registerMetric(suitablePRs)
const candidatesFound = new client.Counter({
  name: 'candidates_found',
  help: 'Count of candidates found by Cerebro so far',
  labelNames: ['lang']
})
register.registerMetric(candidatesFound)

function start ({ port = 9100 }) {
  server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.end(metrics)
  })

  server.listen(port)
  console.log(`Metrics running at http://127.0.0.1:${port}`)
}

function stop () {
  server.close()
}

module.exports = {
  custom: {
    candidatesFound,
    uniqueEventsProcessed,
    suitablePRs
  },
  start,
  stop
}
