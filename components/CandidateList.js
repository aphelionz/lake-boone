import Image from 'next/image'
import Link from 'next/link'

import { useContext, useEffect, useState } from 'react'
import AuthContext from '../components/Interface'

export default function CandidateList (props) {
  return (
    <>
    { props.candidates.map(candidate => (
      <div key={candidate.login + candidate.prHtmlUrl} className="CandidateCard">
        <Image src={candidate.avatar_url} alt='' width='120' height='120' />
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

