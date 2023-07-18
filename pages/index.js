import { useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'

import Debug from '../components/Debug'
import Seeker from '../components/Seeker'
import GitHubLogin from '../components/GitHubLogin'

function HomePage (props) {
  const [commentThreshold, setCommentThreshold] = useState(3)
  const [changeSetThreshold, setChangeSetThreshold] = useState(5432)
  const [selected, setSelected] = useState([])
  const [languages, setLanguages] = useState([
    { value: 1, label: 'JavaScript' },
    { value: 2, label: 'Rust' },
    { value: 3, label: 'C++' }
  ])
  const [showHireable, setShowHireable] = useState(false)
  const [suggestions, setSuggestions] = useState([
    { value: 1, label: 'JavaScript' },
    { value: 2, label: 'Rust' },
    { value: 3, label: 'C++' }
  ])

  function handleTagAddition (tag) {
    const newLangs = [].concat(selected, tag)
    setSelected(newLangs)
  }

  function handleTagDeletion (index) {
    const newLangs = languages.slice(0)
    newLangs.splice(index, 1)
    setLanguages(newLangs)
  }

  return (
    <div>
      <Debug />

      <GitHubLogin clientId={process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID} />
      <h1>Lake Boone</h1>
      <h2>OSINT Recruiting App</h2>

      <form>
        <label>
          Languages:
          <ReactTags
            labelText=""
            selected={languages}
            suggestions={suggestions}
            onDelete={handleTagDeletion}
            onAdd={handleTagAddition}
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
