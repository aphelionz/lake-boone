import { createContext, useEffect, useState } from 'react'

import Header from '../components/Header'
import CandidateList from '../components/CandidateList'
import Seeker from '../components/Seeker'

export const AuthContext = createContext({})

export default function Interface (props) {
  const context = props.context || {}
  const isLoggedIn = context.accessToken !== null

  const [candidates, setCandidates] = useState([])

  function updateCandidates(newCandidates) {
    setCandidates(candidates => [...newCandidates])
  }

  if (!isLoggedIn) {
    return (
      <AuthContext.Provider value={context}>
        <Header />
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={context}>
      <Header />
      <CandidateList candidates={candidates} />
      <Seeker onCandidateFound={updateCandidates}/>
    </AuthContext.Provider>
  );
}

