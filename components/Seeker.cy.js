import React from 'react'
import Seeker from './Seeker'

describe('<Seeker />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Seeker />)
  })

  it('renders', () => {
    cy.mount(<Seeker />)

    cy.get('h2:first-child').contains('Candidates')
  })
})
