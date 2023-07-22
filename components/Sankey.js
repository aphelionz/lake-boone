import { useEffect } from 'react'

import { Chart, LinearScale } from 'chart.js'
import { SankeyController, Flow } from 'chartjs-chart-sankey'

export default function Sankey (props) {
  useEffect(() => {
    Chart.register(SankeyController, Flow, LinearScale)
    const ctx = document.getElementById('chart').getContext('2d')

    // default values
    const metrics = props.metrics || {}
    const uniqueEvents = metrics.uniqueEvents || 0
    const prEvents = metrics.prEvents || 0
    const discardedEvents = uniqueEvents - prEvents
    const missedCommentCount = metrics.missCommentCount || 0
    const missedIncludedLangs = metrics.missIncludedLangs || 0
    const missedPRSize = metrics.missedPRSize || 0
    const missedNonHireable = metrics.missNonHireable || 0
    const missBot = metrics.missBot || 0
    const candidatesFound = metrics.candidatesFound || 0
    const suitablePRs = metrics.suitablePRs || 0

    // console.assert(uniqueEvents - discardedEvents === prEvents, 'uniqueEvents - discardedEvents === prEvents')
    // console.assert(prEvents - missedCommentCount - missedPRSize === suitablePRs, `prEvents - missedCommentCount - missedIncludedLangs - missedPRSize === suitablePRs.`)
    // console.assert(suitablePRs - missedIncludedLangs - missedNonHireable - missBot === candidatesFound, 'suitablePRs - missedIncludedLangs - missedNonHireable - missBot === candidatesFound')

    const sankeyChart = new Chart(ctx, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'Pipeline',
          data: [
            { from: 'uniqueEvents', to: 'discardedEvents', flow: 1 },
            { from: 'uniqueEvents', to: 'prMergeEvents', flow: 5 },
            { from: 'prMergeEvents', to: 'missedCommentCount', flow: 1 },
            { from: 'prMergeEvents', to: 'suitablePRs', flow: 4 },
            { from: 'prMergeEvents', to: 'missedPRSize', flow: 1 },
            { from: 'suitablePRs', to: 'missedIncludedLangs', flow: 1 },
            { from: 'suitablePRs', to: 'missedNonHireable', flow: 1 },
            { from: 'suitablePRs', to: 'missBot', flow: 1 },
            { from: 'suitablePRs', to: 'candidatesFound', flow: 1 }
          ],
          colorFrom: (c) => '#ccc',
          colorTo: (c) => '#ccc',
          colorMode: 'gradient',
          labels: {
            uniqueEvents: `Event Feed (${uniqueEvents})`,
            discardedEvents: `Discarded (${discardedEvents})`,
            prMergeEvents: `Merged Pull Requests (${prEvents})`,
            missedCommentCount: `Not enough comments (${missedCommentCount})`,
            missedPRSize: `Oversized PR (${missedPRSize})`,
            suitablePRs: `Potential Candidates (${suitablePRs})`,
            missedIncludedLangs: `Wrong Language (${missedIncludedLangs})`,
            missedNonHireable: `Not Hireable (${missedNonHireable})`,
            missBot: `Bot (${missBot})`,
            candidatesFound: `Viable (${candidatesFound})`
          }
        }]
      },
      options: {
        animation: false
      }
    })

    return () => {
      sankeyChart.destroy()
    }
  })

  return (<canvas id='chart' />)
}
