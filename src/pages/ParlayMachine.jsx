import React from 'react'
import styled, { css } from 'styled-components'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container'
import _ from 'lodash'

function ParlayMachine() {
  const [games, setGames] = React.useState(null)
  const [week, setWeek] = React.useState('')
  const [matchups, setMatchups] = React.useState(null)
  const [lockedGames, setLockedGames] = React.useState([])

  const pickWinner = (matchup, winner, index) => {
    let newMatchups = matchups
    console.log(matchups[index])
    newMatchups[index] = Object.assign({}, matchup, { pickedWinner: winner })
    setMatchups([...newMatchups])
  }

  const lockGame = (gameKey) => {
    lockedGames.push(gameKey)
    setLockedGames([...lockedGames])
  }

  const unlockGame = (gameKey) => {
    lockedGames.splice(lockedGames.indexOf(gameKey), 1)
    setLockedGames([...lockedGames])
  }

  const randomize = () => {
    const newMatchups = matchups.map((matchup) => {
      const teams = [matchup.HomeTeam, matchup.AwayTeam]
      if (!lockedGames.includes(matchup.GameKey)) {
        return Object.assign({}, matchup, {
          pickedWinner: teams[Math.round(Math.random())],
        })
      }
      return matchup
    })
    console.log(newMatchups)
    setMatchups(newMatchups)
  }

  const createMatchups = (weekNumber) => {
    setWeek(weekNumber)
    setMatchups(
      games[weekNumber].map((game) => {
        const matchup = Object.assign({}, game, { pickedWinner: null })
        return matchup
      }),
    )
  }

  React.useEffect(() => {
    // fetch from API
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
        setGames(_.groupBy(data, 'Week'))
      })
  }, [])

  console.log(matchups, 'rerendering')

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">ParlayMachine</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"></Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <FlexContainer width={350}>
        <div>
          <select value={week} onChange={(e) => createMatchups(e.target.value)}>
            <option value={null}>Select Week</option>
            {_.keys(games).map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
          {matchups && <button onClick={randomize}>Shuffle Picks</button>}
        </div>

        {matchups?.map((matchup, index) => {
          if (matchup.GameKey) {
            const matchupLocked = lockedGames.includes(matchup.GameKey)
            return (
              <GameRow>
                <TeamSection
                  style={{
                    backgroundColor:
                      matchup.pickedWinner === matchup.AwayTeam
                        ? '#9ef01a'
                        : '',
                  }}
                  onClick={() => pickWinner(matchup, matchup.AwayTeam, index)}
                  away={true}
                >
                  <span>{matchup.AwayTeam}</span>
                  <br />
                  <Odds>
                    {matchup.AwayTeamMoneyLine > 0
                      ? `+${matchup.AwayTeamMoneyLine}`
                      : matchup.AwayTeamMoneyLine}
                  </Odds>
                </TeamSection>
                <At
                  onClick={() => {
                    matchupLocked
                      ? unlockGame(matchup.GameKey)
                      : lockGame(matchup.GameKey)
                  }}
                >
                  {matchupLocked ? 'L' : '@'}
                </At>
                <TeamSection
                  style={{
                    backgroundColor:
                      matchup.pickedWinner === matchup.HomeTeam
                        ? '#9ef01a'
                        : '',
                  }}
                  onClick={() => pickWinner(matchup, matchup.HomeTeam, index)}
                  home={true}
                >
                  {matchup.HomeTeam}
                  <br />
                  <Odds>
                    {matchup.HomeTeamMoneyLine > 0
                      ? `+${matchup.HomeTeamMoneyLine}`
                      : matchup.HomeTeamMoneyLine}
                  </Odds>
                </TeamSection>
              </GameRow>
            )
          }
          return null
        })}
      </FlexContainer>
    </>
  )
}

export default ParlayMachine

const LockButton = styled.div`
  position: absolute;
  margin: auto;
`

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  margin: auto;

  ${(props) =>
    props.width &&
    css`
      width: ${props.width}px;
    `}
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
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  ${(props) =>
    props.winner &&
    css`
      background-color: green;
    `}

  ${(props) =>
    props.away &&
    css`
      align-items: flex-start;
    `}

  ${(props) =>
    props.home &&
    css`
      align-items: flex-end;
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
