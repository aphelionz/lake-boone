const metrics = require('./metrics')
const seeker = require('./seeker')
const output = require('./output')

// Initialization
// TODO: Validate these
const {
  GH_TOKEN,
  COMMENT_THRESHOLD,
  SHOW_NON_HIREABLE,
  CHANGESET_THRESHOLD,
  LANGUAGES
} = process.env

const targetLanguages = LANGUAGES.split(',').map(l => l.toLowerCase())
if (targetLanguages.length === 0) { throw new Error('Please specify at least one programming language using LANGUAGES') }

// Start our GitHub events seeker
seeker.start(
  GH_TOKEN || null,
  {
    parsedThreshold: isNaN(parseInt(COMMENT_THRESHOLD)) ? parseInt(COMMENT_THRESHOLD) : 3,
    showNonHireable: SHOW_NON_HIREABLE || false,
    changeSetThreshold: CHANGESET_THRESHOLD || 5432,
    targetLanguages
  }
)

seeker.events.on('_debug.uniqueEvents', (count) => {
  metrics.custom.uniqueEventsProcessed.inc(count)
})
seeker.events.on('_debug.suitablePRs', (count) => {
  metrics.custom.suitablePRs.inc(count)
})

function outputCandidate (candidate) {
  output.console(candidate)
  metrics.custom.candidatesFound.labels({ lang: candidate.includedLangs[0] }).inc(1)
}
seeker.events.on('candidateFound', outputCandidate)

// Start Prometheus metrics server on the specified port
metrics.start({ port: 9100 })

// Exit cleanly on SIGINT
// TODO: Maybe emit stats?
process.on('SIGINT', function (e) {
  console.log('stopping metrics...')
  metrics.stop()

  console.log('stopping seeker...')
  seeker.events.off('candidateFound', outputCandidate)
  seeker.stop()
  process.exit()
})
