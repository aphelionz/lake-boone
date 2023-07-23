import Image from 'next/image'
import Link from 'next/link'

import { useContext, useEffect, useState } from 'react'
import AuthContext from '../components/Interface'

// This component only responds to props changes
export default function CandidateList (props) {
  // Handle undefined prop.candidates
  const candidates = props.candidates || [];

  // Apply defaults
  const hydratedCandidates = candidates.map(candidate => {
    const defaults = {
      avatar_url: 'https://github.com/identicons/unknown.png',
      bio: 'No bio',
      blog: '',
      company: '',
      html_url: '',
      location: '',
      login: 'unknown',
      prHtmlUrl: '',
      twitter_username: '',
    }

    return Object.assign(defaults, candidate)
  })

  // Get unique candidates
  const uniqueCandidates = hydratedCandidates.reduce((acc, candidate) => {
    const existingCandidate = acc.find(c => c.login === candidate.login)
    if (!existingCandidate) {
      acc.push(candidate)
    }
    return acc
  }, [])

  return (
    <>
    { uniqueCandidates.map(candidate => (
      <div key={candidate.login + candidate.prHtmlUrl} className="CandidateCard">
        <Image unoptimized src={candidate.avatar_url} alt='' width='120' height='120' />
        <div className="CandidateCard__info">
          <h4><Link href={candidate.html_url}>{candidate.login}</Link></h4>
          <div>via <Link href={candidate.prHtmlUrl}>this pull request</Link></div>
          <div>{candidate.bio}</div>
          <div>
            {candidate.blog ? <Link href={candidate.blog}>web</Link> : null}
            {
              candidate.twitter_username
                ? <Link href={'https://twitter.com/' + candidate.twitter_username}>twitter</Link>
                : null
            }
          </div>
          <div>
            { 
              candidate.company ? 
              <div>Company: {candidate.company}, {candidate.location}</div>
              : null
            }
          </div>
        </div>
      </div>
    )) }
  </>
  )
}

// <div>{candidate.includedLangs.join(', ')}</div>

