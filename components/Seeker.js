import { useContext, useEffect, useState } from 'react'
const { Octokit } = require('@octokit/rest')
import { WithContext as ReactTags } from 'react-tag-input';

import Sankey from '../components/Sankey'
import { AuthContext } from '../components/Interface'

import { getUniqueEvents, getPrMergeEvents, getSuitablePRs, filterLanguages, formatSuitablePRs, extractCandidate } from './Heuristics'
// The main data pipeline
// 1. Get new events from GitHub
// 2. Find events that are pull request merges
// 3. Find pull requests that are suitable for further considerations
// 4. Format the pull requests for the UI
// 5. Extract candidates from the pull requests
// 6. Emit the candidates
export function seek (options, octokit) {
  const defaultParams = octokit.activity.listPublicEvents.endpoint.DEFAULTS || {}
  defaultParams.url = `/events?per_page=100&${ new Date().getTime() }`
  
  const metrics = {
    candidates: [],
    uniqueEvents: 0,
    prEvents: 0,
    suitablePRs: 0,
    missBot: 0,
    missCommentCount: 0,
    missIncludedLangs: 0,
    missChangesetSize: 0,
    missNonHireable: 0,
    candidatesFound: 0
  }

  return octokit.request(defaultParams)
    .then(res => res.data)
    .then(eventStream => getUniqueEvents(eventStream, options, metrics))
    .then(({uniqueEvents, metrics}) => getPrMergeEvents(uniqueEvents, options, metrics))
    .then(({prMergeEvents, metrics}) => getSuitablePRs(prMergeEvents, options, metrics))
    .then(({filteredPRs, metrics}) => filterLanguages(filteredPRs, octokit, options, metrics))
    .then(({filteredPRs, metrics}) => formatSuitablePRs(filteredPRs, options, metrics))
    .then(({formattedPRs, metrics}) => extractCandidate(formattedPRs, octokit, options, metrics))
    .catch(console.error)
}

export default function Seeker (props) {
  const context = useContext(AuthContext)

  const isLoggedIn = context.accessToken !== null
  const changeSetThreshold = props.changeSetThreshold || 5432
  const onCandidateFound = props.onCandidateFound || console.log

  const [candidates, setCandidates] = useState([])
  const [commentThreshold, setCommentThreshold] = useState(3)
  const [showNonHireable, setShowNonHireable] = useState(false)
  const [started, setStarted] = useState(false)
  const [metrics, setMetrics] = useState({})
  const [tags, setTags] = useState([
    { id: 'Go', text: 'Go' },
    { id: 'Rust', text: 'Rust' },
    { id: 'C++', text: 'C++' },
  ])

  const languages = context.languageList.map(l => ({ id: l, text: l }))
  const [suggestions, setSuggestions] = useState(languages || [])

  function handleTagAddition (newTag) {
    setTags(tags => [...tags, newTag])
  }

  function handleTagDeletion (index) {
    const newTags = tags.slice(0)
    newTags.splice(index, 1)
    setTags(newTags)
  }

  useEffect(() => {
    const octokit = new Octokit({
      auth: context.accessToken,
      userAgent: 'lakeboone v0.3.0',
      request: {}
    })

    const interval = context.accessToken ? 1000 : 60000
    const seekInterval = setInterval(async () => {
      const targetLanguages = tags.map(t => t.id)

      const results = await seek({
        targetLanguages,
        showNonHireable,
        commentThreshold,
        changeSetThreshold
      }, octokit, metrics) || {}

      const newCandidates = results.candidates || []
      setCandidates(candidates => candidates.concat(newCandidates))
      if(candidates.length > 0) { props.onCandidateFound(candidates) }
      delete results.candidates

      Object.keys(results).forEach(key => {
        const originalValue = metrics[key] || 0
        metrics[key] = originalValue + results[key]
      })

      const rateLimit = await octokit.rest.rateLimit.get()
      const { limit, used, remaining } = rateLimit.data.resources.core
      setMetrics({...metrics, candidates, limit, used, remaining})
    }, interval);

    setStarted(true)

    return function cleanup() {
      clearInterval(seekInterval)
      setStarted(false)
    }
  }, [started, tags, showNonHireable, commentThreshold, candidates])

  return (
    <>
      <h3>Pipeline</h3>

      Seeking candidates for:
      <ReactTags
        autocomplete
        labelText="Select candidates for:"
        allowDragDrop={false}
        tags={tags}
        suggestions={suggestions}
        handleDelete={handleTagDeletion}
        handleAddition={handleTagAddition}
        onTagUpdate = {props.onTagUpdate}
        inputFieldPosition="bottom"
      />
      <label>
        Show Non-Hireable
        <input type="checkbox"
          checked={showNonHireable}
          onChange={e => setShowNonHireable(e.target.checked)}
        />
      </label>
      <br />
      <label>
        Comment Threshold
        <input type="number"
          value={commentThreshold}
          onChange={e => setCommentThreshold(e.target.value)}
        />
      </label>
      <br />
      <Sankey commentThreshold={commentThreshold} metrics={metrics} />
      <small>
        Limit: { metrics.limit } Used: { metrics.used } Remaining: { metrics.remaining }
      </small>
    </>
  )
}
