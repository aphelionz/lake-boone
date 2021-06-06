const client = require('prom-client')
const http = require('http')

let server

const register = new client.Registry()
register.setDefaultLabels({ app: 'cerebro' })
client.collectDefaultMetrics({ register })

// TODO: Maybe we need to change these back to Counters, maybe not.
const uniqueEvents = new client.Gauge({
  name: 'unique_events_processed',
  help: 'Number of unique events processed by Cerebro'
})
register.registerMetric(uniqueEvents)

const pullRequests = new client.Gauge({
  name: 'pull_requests_processed',
  help: 'Count of total pull request events processed.'
})
register.registerMetric(pullRequests)

const suitablePRs = new client.Gauge({
  name: 'suitable_pull_requests_found',
  help: 'Number of suitable pull requests by Cerebro'
})
register.registerMetric(suitablePRs)

const missIncludedLangs = new client.Gauge({
  name: 'miss_included_langs',
  help: 'Pull request -> candidate miss based on target programming language'
})
register.registerMetric(missIncludedLangs)

const missNonHireable = new client.Gauge({
  name: 'miss_non_hireable',
  help: 'Pull request -> candidate miss candidate.hirable value'
})
register.registerMetric(missNonHireable)

const candidatesFound = new client.Gauge({
  name: 'candidates_found',
  help: 'Count of candidates found by Cerebro so far',
  labelNames: ['lang']
})
register.registerMetric(candidatesFound)

function start ({ port = 9100 } = {}) {
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
    missIncludedLangs,
    missNonHireable,
    pullRequests,
    uniqueEvents,
    suitablePRs
  },
  start,
  stop
}
