import { useState } from 'react'

import seeker from '../src/seeker.js'
import Seeker from '../components/Seeker'
import GitHubLogin from '../components/GitHubLogin'

function HomePage (props) {
  const [languages, setLanguages] = useState('JavaScript, Rust, Solidity')

  return (
    <div>
      <GitHubLogin clientId={process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID} />
      <h1>Lake Boone</h1>
      <h2>Prototypal OSINT Recruiting App</h2>

      <form>
        <fieldset>
          <label>
            Languages:
            <input
              type='text'
              name='languages'
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
          </label>
          <details>
            <summary>Advanced</summary>
            Coming Soon
          </details>
          <input type='submit' value='Update Seeker' />
        </fieldset>
      </form>
      <Seeker
        commentThreshold='3'
        showNonHireable='false'
        targetLanguages='javascript,rust,typescript,solidity'
        changeSetThreshold='4321'
      />
    </div>
  )
}

export default HomePage
