const metrics = require('./metrics')
const {
  candidatesFound,
  missIncludedLangs,
  missNonHireable,
  pullRequests,
  uniqueEvents,
  suitablePRs
} = require('./metrics').custom
const seeker = require('./seeker')
const ui = require('live-server')
const websocket = require('./output/websocket')

// Initialization
// TODO: Validate these
const {
  GH_TOKEN = null,
  COMMENT_THRESHOLD = 3,
  SHOW_NON_HIREABLE = false,
  CHANGESET_THRESHOLD = 5432,
  LANGUAGES
} = process.env

const targetLanguages = LANGUAGES.split(',').map(l => l.toLowerCase())
if (targetLanguages.length === 0) { throw new Error('Please specify at least one programming language using LANGUAGES') }

// Start our GitHub events seeker
seeker.start(
  GH_TOKEN,
  {
    parsedThreshold: parseInt(COMMENT_THRESHOLD, 10),
    showNonHireable: SHOW_NON_HIREABLE,
    changeSetThreshold: CHANGESET_THRESHOLD,
    targetLanguages
  }
)

seeker.events.on('metrics', async (metrics) => {
  uniqueEvents.set(metrics.uniqueEvents)
  pullRequests.set(metrics.prEvents)
  suitablePRs.set(metrics.suitablePRs)
  missIncludedLangs.set(metrics.missIncludedLangs)
  missNonHireable.set(metrics.missNonHireable)
  // TODO: Fix lang labels
  candidatesFound.set(metrics.candidatesFound)

  websocket.broadcast({ metrics })
})

seeker.events.on('candidate-found', (candidate) => {
  websocket.broadcast({ candidate })
})

// Start Prometheus metrics server on the default port 8080
websocket.start()

// Start Prometheus metrics server on the default port 9100
metrics.start()

// Start examples UI for now
ui.start({
  port: 3000,
  root: './examples',
  open: false
})

// Exit cleanly on SIGINT
// TODO: Maybe emit stats?
process.on('SIGINT', function (e) {
  console.log('stopping metrics...')
  metrics.stop()

  console.log('stopping seeker...')
  seeker.events.removeAllListeners()
  seeker.stop()

  console.log('stopping examples ui...')
  ui.shutdown()
  process.exit()
})
