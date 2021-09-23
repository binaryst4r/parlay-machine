import React, { Component } from 'react'
import logo from './logo.svg'
import styled, { css } from 'styled-components'
import Navbar  from 'react-bootstrap/Navbar'
import Nav  from 'react-bootstrap/Nav'
import NavDropdown  from 'react-bootstrap/NavDropdown'
import Container  from 'react-bootstrap/Container'
import _ from 'lodash'
import './App.css'

class App extends Component {
  state = {
    schedule: [],
    showWeek: 3,
    winners: []
  }
  componentDidMount() {
    fetch(
      'https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2021?key=df7642467cd4482cb377b5a0ead73dda',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': 'df7642467cd4482cb377b5a0ead73dda',
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          schedule: data,
        })
      })
  }

  addWinner = (teamId) => {
    let newWinners = this.state.winners.push(teamId)
    this.setState({winners: newWinners})
  }

  removeWinner = (teamId) => {
    let newWinners = this.state.winners.delete(teamId)
    this.setState({winners: newWinners})
  }

  render() {
    const { schedule, showWeek } = this.state
    let scheduleByWeek
    if (schedule.length) {
      scheduleByWeek = _.groupBy(schedule, 'Week')
    }

    return (
      <>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="/">ParlayMachine</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {/* <Nav.Link href="/">Parlay</Nav.Link> */}
                {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown> */}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <FlexContainer>
          <select
            value={showWeek}
            onChange={(e) => this.setState({ showWeek: e.target.value })}
          >
            <option>Select Week</option>
            {_.keys(scheduleByWeek).map((week) => (
              <option value={week}>Week {week}</option>
            ))}
          </select>
          {showWeek && scheduleByWeek && (
            <ParlayContainer>
              <VerticalDivider />
              {scheduleByWeek[showWeek].map((game, i) => {
                if (game.GameKey) {
                  return (
                    <GameRow>
                      <TeamSection onClick={() => this.addWinner(game.awayTeam)} home={true}>
                        <span>{game.AwayTeam}</span>
                        <br />
                        <Odds>
                          {game.AwayTeamMoneyLine > 0
                            ? `+${game.AwayTeamMoneyLine}`
                            : game.AwayTeamMoneyLine}
                        </Odds>
                      </TeamSection>
                      <At>@</At>
                      <TeamSection away={true}>
                        {game.HomeTeam}
                        <br />
                        <Odds>
                          {game.HomeTeamMoneyLine > 0
                            ? `+${game.HomeTeamMoneyLine}`
                            : game.HomeTeamMoneyLine}
                        </Odds>
                      </TeamSection>
                    </GameRow>
                  )
                }
                return null
              })}
              <OddsContainer>Odds</OddsContainer>
            </ParlayContainer>
          )}
        </FlexContainer>
      </>
    )
  }
}

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
`

const OddsContainer = styled.div`
  width: 100%;
  height: 70px;
  background: #ddd;
  display: flex;
`

const At = styled.div`
  font-size: 18px;
  height: 35px;
  width: 35px;
  border: 1px solid #ddd;
  border-radius: 50%;
  z-index: 2020;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Odds = styled.span`
  font-size: 16px;
  line-height: 1.4;
`

const TeamSection = styled.div`
  font-size: 16px;
  width: 50%;
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  ${props => props.away && css`
    align-items: flex-end;
  `}

  ${props => props.home && css`
    align-items: flex-start;
  `}

  &:hover {
    background-color: #f9f9f9;
  }
`
const GameRow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const ParlayContainer = styled.div`
  position: relative;
  width: 340px;
  display: flex;
  flex-direction: column;
  margin: auto;
`

const VerticalDivider = styled.div`
  width: 1px;
  position: absolute;
  left: 0;
  right: 0;
  height: 100%;
  background-color: #ddd;
  margin: auto;
`

export default App
