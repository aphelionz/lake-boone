import Image from 'next/image'
import Link from 'next/link'

export default function CandidateList (props) {
  const candidateItems = props.candidates.map(candidate => {
    const {
      avatar_url,
      bio,
      hireable,
      blog,
      twitter_username,
      company,
      location,
      html_url,
      login,
      includedLangs,
      prHtmlUrl
    } = candidate

    return (<>
      <h3><Link href={ html_url }>{login}</Link></h3>
      <Image src={ avatar_url } alt="" width="120" />
      <div>{ bio }</div>
      <div>{ includedLangs }</div>
      { hireable ? <div>Hireable: ✔️</div> : null }
      <div>
        <Link href={ blog }>web</Link>&nbsp;
        <Link href={ '//twitter.com/' + twitter_username }>twitter</Link>&nbsp;
        <Link href={ prHtmlUrl }>pull request</Link>
      </div>
      { company ? <div>Company: { company }, { location }</div> : null }
    </>)
  })

  return candidateItems
}
