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

seeker.events.on('miss-included-langs', count => missIncludedLangs.inc(count))
seeker.events.on('miss-non-hireable', count => missNonHireable.inc(count))

seeker.events.on('stats-unique-events', count => uniqueEvents.inc(count))
seeker.events.on('stats-pull-requests', count => pullRequests.inc(count))
seeker.events.on('stats-suitable-prs', count => suitablePRs.inc(count))

function outputCandidate (candidate) {
  console.log(candidate)
  candidatesFound.labels({ lang: candidate.includedLangs[0] }).inc(1)
}
seeker.events.on('candidate-found', outputCandidate)

// Start Prometheus metrics server on the specified port
metrics.start({ port: 9100 })

// Exit cleanly on SIGINT
// TODO: Maybe emit stats?
process.on('SIGINT', function (e) {
  console.log('stopping metrics...')
  metrics.stop()

  console.log('stopping seeker...')
  seeker.events.removeAllListeners()
  seeker.stop()
  process.exit()
})
