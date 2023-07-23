import { createContext, useEffect, useState } from 'react'

import Header from '../components/Header'
import LanguageSelect from '../components/LanguageSelect'
import CandidateList from '../components/CandidateList'
import Seeker from '../components/Seeker'

export const AuthContext = createContext({})

export default function Interface (props) {
  const context = props.context || {}
  const isLoggedIn = context.accessToken !== null

  const [candidates, setCandidates] = useState([])

  if (!isLoggedIn) {
    return (
      <AuthContext.Provider value={context}>
        <Header />
      </AuthContext.Provider>
    )
  }

  function updateCandidates(newCandidate) {
    setCandidates(candidates => [...candidates, newCandidate])
  }

  function updateLanguage(language) {
    console.log(language)
  }

  return (
    <AuthContext.Provider value={context}>
      <Header />
      <LanguageSelect onTagUpdate={updateLanguage}/>

      <h3>Viable Candidates</h3>
      <CandidateList candidates={candidates} />

      <Seeker
        targetLanguages={"C++,Rust,Go"}
        onCandidateFound={updateCandidates}
      />

    </AuthContext.Provider>
  );
}

