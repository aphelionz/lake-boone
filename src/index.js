const metrics = require('./metrics')
const seeker = require('./seeker')

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
if (targetLanguages.length === 0)
  throw new Error("Please specify at least one programming language using LANGUAGES")

// Start our GitHub events seeker
seeker.start(
  auth = GH_TOKEN ? GH_TOKEN : null,
  {
    parsedThreshold: isNaN(parseInt(COMMENT_THRESHOLD)) ? parseInt(COMMENT_THRESHOLD) : 3,
    showNonHireable: SHOW_NON_HIREABLE ? SHOW_NON_HIREABLE : false,
    changeSetThreshold: process.env.CHANGESET_THRESHOLD || 5432,
    targetLanguages
  }
)

// Start Prometheus metrics server on the specified port
metrics.start({ port: 9100 })

// Exit cleanly on SIGINT
// TODO: Maybe emit stats?
process.on('SIGINT', function(e) {
  console.log("Cleanly shutting down")
  metrics.stop()
  // seeker.stop()
  process.exit()
});
