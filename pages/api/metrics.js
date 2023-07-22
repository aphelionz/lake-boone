export default async function handler (req, res) {
  const response = {
    custom: {
      candidatesFound: 0,
      uniqueEvents: 0,
      pullRequests: 0,
      missNonHireable: 0,
      missIncludedLangs: 0,
      suitablePRs: 0
    }
  }

  try {
  } catch (e) {
    response.error = e
  }

  res.json(response)
}

