const client = require('prom-client')
const http = require('http')
const url = require('url')

const register = new client.Registry()

register.setDefaultLabels({
  app: 'cerebro-cli'
})

client.collectDefaultMetrics({ register })
const candidatesFound = new client.Counter({
  name: 'candidates_found',
  help: 'Count of candidates found by Cerebro so far',
});
register.registerMetric(candidatesFound)

const server = http.createServer(async (req, res) => {
  const route = url.parse(req.url).pathname
  let metrics

  if (route === '/metrics') {
    res.setHeader('Content-Type', register.contentType)
    metrics = await register.metrics()
  }

  res.end(metrics)
})

server.listen(8080)

module.exports = {
  candidatesFound
}
