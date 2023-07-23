import React from 'react'
import CandidateList from './CandidateList'

describe('<CandidateList />', () => {
  it('renders blank with empty props', () => { cy.mount(<CandidateList />) })

  it('renders a single candidate with default values', () => {
    const candidates = [{}]

    cy.mount(<CandidateList candidates={ candidates }/>)
      .get('.CandidateCard').should('have.length', 1)
  })

  it('list 2 candidates from 3 non-unique', () => {
    const candidates = [{ login: 'foo' }, { login: 'foo' }, { login: 'bar' }]

    cy.mount(<CandidateList candidates={ candidates }/>)
      .get('.CandidateCard').should('have.length', 2)
  })

  it('responds to updates', () => {
    const candidates = [{ login: 'foo' }, { login: 'foo' }, { login: 'bar' }]

    cy.mount(<CandidateList candidates={ candidates }/>)
      .get('.CandidateCard').should('have.length', 2)
  })
})
