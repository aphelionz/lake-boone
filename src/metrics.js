const client = require('prom-client')
const http = require('http')

let server

const register = new client.Registry()
register.setDefaultLabels({ app: 'cerebro' })
client.collectDefaultMetrics({ register })

const uniqueEvents = new client.Counter({
  name: 'unique_events_processed',
  help: 'Number of unique events processed by Cerebro'
})
register.registerMetric(uniqueEvents)

const pullRequests = new client.Counter({
  name: 'pull_requests_processed',
  help: 'Count of total pull request events processed.'
})
register.registerMetric(pullRequests)

const suitablePRs = new client.Counter({
  name: 'suitable_pull_requests_found',
  help: 'Number of suitable pull requests by Cerebro'
})
register.registerMetric(suitablePRs)

const missIncludedLangs = new client.Counter({
  name: 'miss_included_langs',
  help: 'Pull request -> candidate miss based on target programming language'
})
register.registerMetric(missIncludedLangs)

const missNonHireable = new client.Counter({
  name: 'miss_non_hireable',
  help: 'Pull request -> candidate miss candidate.hirable value'
})
register.registerMetric(missNonHireable)

const candidatesFound = new client.Counter({
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
