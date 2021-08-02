import { useState } from 'react'
import ReactTags from 'react-tag-autocomplete'

import seeker from '../src/seeker.js'
import Seeker from '../components/Seeker'
import GitHubLogin from '../components/GitHubLogin'

function HomePage (props) {
  const [commentThreshold, setCommentThreshold] = useState(3)
  const [changeSetThreshold, setChangeSetThreshold] = useState(5432)
  const [languages, setLanguages] = useState([
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Rust' },
    { id: 3, name: 'Solidity' }
  ])
  const [showHireable, setShowHireable] = useState(false)
  const [suggestions, setSuggestions] = useState([
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Rust' },
    { id: 3, name: 'Solidity' }
  ])

  function handleTagAddition (tag) {
    const newLangs = [].concat(languages, tag)
    setLanguages(newLangs)
  }

  function handleTagDeletion (index) {
    const newLangs = languages.slice(0)
    newLangs.splice(index, 1)
    setLanguages(newLangs)
  }

  function restartSeekerWithNewParams (e) {
    e.preventDefault()

    console.log(e)
  }

  return (
    <div>
      <GitHubLogin clientId={process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID} />
      <h1>Lake Boone</h1>
      <h2>Prototypal OSINT Recruiting App</h2>

      <form>
        <label>
          Languages:
          <ReactTags
            // ref={this.reactTags}
            tags={languages}
            suggestions={suggestions}
            onDelete={handleTagDeletion}
            onAddition={handleTagAddition}
          />
        </label>
        <details>
          <summary>Advanced</summary>
          <div>
            <label>Comment Threshold:
              <input
                type='range'
                min='0' max='9'
                value={commentThreshold}
                onChange={(e) => setCommentThreshold(e.target.value)}
              />
              [{commentThreshold}]
            </label>
          </div>
          <div>
            <label>Changeset Threshold:
              <input
                type='range'
                min='50' max='10000'
                onChange={(e) => setChangeSetThreshold(e.target.value)}
                value={changeSetThreshold}
              />
              [{changeSetThreshold}]
            </label>
          </div>
          <div>
            <label>Show Hireable:
              <input
                type='checkbox'
                checked={showHireable}
                onChange={(e) => setShowHireable(e.target.checked)}
              />
            </label>
          </div>
        </details>
        <input
          type='submit'
          value='[re]start seeker'
          onClick={restartSeekerWithNewParams}
        />
      </form>
      <Seeker
        commentThreshold={3}
        showNonHireable={false}
        targetLanguages={
          languages
            .map(l => l.name)
            .join(',')
        }
        changeSetThreshold={4321}
      />
    </div>
  )
}

export default HomePage
