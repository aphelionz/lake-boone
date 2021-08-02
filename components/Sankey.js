import { useEffect } from 'react'

import { Chart, LinearScale } from 'chart.js'
import { SankeyController, Flow } from 'chartjs-chart-sankey'

export default function Sankey (props) {
  useEffect(() => {
    Chart.register(SankeyController, Flow, LinearScale)
    const ctx = document.getElementById('chart').getContext('2d')

    const sankeyChart = new Chart(ctx, {
      type: 'sankey',
      data: {
        datasets: [{
          label: 'Pipeline',
          data: [
            { from: 'a', to: 'b', flow: 1 },
            { from: 'a', to: 'c', flow: 4 },
            { from: 'c', to: 'b', flow: 1 },
            { from: 'c', to: 'd', flow: 6 },
            { from: 'd', to: 'e', flow: 2 },
            { from: 'd', to: 'f', flow: 2 },
            { from: 'd', to: 'g', flow: 2 }
          ],
          // colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
          // colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
          colorMode: 'gradient',
          labels: {
            a: `Unique Events (${props.uniqueEvents})`,
            b: `Discarded Events (${props.uniqueEvents - props.prEvents})`,
            c: `PR Merge Events (${props.prEvents})`,
            d: `Suitable PRs (${props.suitablePRs})`,
            e: `Miss: language mismatch (${props.missIncludedLangs})`,
            f: `Miss: non-hireable (${props.missNonHireable})`,
            g: `Candidates Found (${props.candidatesFound})`
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
