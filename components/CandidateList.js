import Image from 'next/image'
import Link from 'next/link'

function truncatePRUrl (prHtmlUrl) {
  const urlParts = prHtmlUrl.split('/')
  return `${urlParts[3]}/${urlParts[4]}#${urlParts[6]}`
}

export default function CandidateList (props) {
  return props.candidates.map(candidate => (
    <div key={candidate.login + candidate.prHtmlUrl}>
      <h3><Link href={candidate.html_url}>{candidate.login}</Link></h3>
      <div>
        via <Link href={candidate.prHtmlUrl}>{truncatePRUrl(candidate.prHtmlUrl)}</Link>
      </div>
      <Image src={candidate.avatar_url} alt='' width='120' height='120' />
      <div>{candidate.bio}</div>
      <div>{candidate.includedLangs.join(', ')}</div>
      {candidate.hireable ? <div>Hireable: ✔️</div> : null}
      <div>
        {candidate.blog ? <Link href={candidate.blog}>web</Link> : null}
        {
          candidate.twitter_username
            ? <Link href={'//twitter.com/' + candidate.twitter_username}>twitter</Link>
            : null
        }
      </div>
      {candidate.company ? <div>Company: {candidate.company}, {candidate.location}</div> : null}
    </div>
  ))
}
