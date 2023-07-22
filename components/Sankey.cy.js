import React from 'react'
import Sankey from './Sankey'

describe('<Sankey />', () => {
  it('renders with default values (zeroes)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Sankey />)

    const chart = cy.get('#chart')
    console.log(chart)
  })
})
