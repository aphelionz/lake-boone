import Interface from '../components/Interface'

export default function HomePage (props) {
  // Default values
  const context = props.context || {}

  return (<Interface context={context} />)
}

export const getServerSideProps = async (context) => {
  return {
    props: {
      context: {
        redirectUri: process.env.REDIRECT_URI,
        accessToken: context.req.cookies.access_token || null,
        ghClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      }
    }
  }
}

