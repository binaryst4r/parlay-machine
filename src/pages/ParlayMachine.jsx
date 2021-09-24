import React from 'react'
import styled, { css } from 'styled-components'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Badge from 'react-bootstrap/Badge'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  solid,
  regular,
  brands,
} from '@fortawesome/fontawesome-svg-core/import.macro' // <-- import styles to be used
import { teamColors } from '../utils/colors'
import moment from 'moment'

function ParlayMachine() {
  const [games, setGames] = React.useState(null)
  const [week, setWeek] = React.useState('')
  const [matchups, setMatchups] = React.useState(null)
  const [lockedGames, setLockedGames] = React.useState([])

  const pickWinner = (matchup, winner, index) => {
    let newMatchups = matchups
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

  const getProbableWinner = (matchup) => {
    let winner = matchup.HomeTeam
    if (matchup.HomeTeamMoneyLine > matchup.AwayTeamMoneyLine) {
      winner = matchup.AwayTeam
    }
    return winner
  }

  const randomize = (onlyHeavyFavorites = false) => {
    const newMatchups = matchups.map((matchup) => {
      const oddsDifferential = Math.abs(_.subtract(matchup.HomeTeamMoneyLine, matchup.AwayTeamMoneyLine))
      const teams = [matchup.HomeTeam, matchup.AwayTeam]
      if (!lockedGames.includes(matchup.GameKey)) {
        let pickedWinner
        const randomWinner = teams[Math.round(Math.random())]
        let probableWinner = getProbableWinner(matchup)
        if (oddsDifferential > 700) {
          pickedWinner = probableWinner
        } else if (onlyHeavyFavorites) {
          pickedWinner = null
        } else {
          pickedWinner = randomWinner
        }

        return Object.assign({}, matchup, {
          pickedWinner
        })
      }
      return matchup
    })

    setMatchups(newMatchups)
  }

  const createMatchups = (weekNumber) => {
    setWeek(weekNumber)
    setMatchups(
      _.sortBy(games[weekNumber], 'DateTime').map((game) => {
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
  console.log(lockedGames, 'hey')
  return (
    <>
      <FlexContainer width={350}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '30px',
          }}
        >
          <Dropdown>
            <Dropdown.Toggle variant="light">
              {week ? `Week ${week}` : `Select Week`}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {_.keys(games).map((weekNumber) => (
                <Dropdown.Item
                  onClick={() => createMatchups(weekNumber)}
                  key={weekNumber}
                  value={weekNumber}
                >
                  Week {weekNumber}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <div style={{display: 'flex'}}>
            <Button
              disabled={!week}
              variant="warning"
              onClick={() => createMatchups(week)}
            >
              Clear <FontAwesomeIcon icon={solid('refresh')} />
            </Button>
            {week &&
              <Dropdown>
                <Dropdown.Toggle variant="primary">
                  <FontAwesomeIcon icon={solid('shuffle')} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => randomize()}>Shuffle All</Dropdown.Item>
                  <Dropdown.Item onClick={() => randomize(true)}>Pick Heavy Favorites</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }
          </div>
        </div>

        {matchups?.map((matchup, index) => {
          if (matchup.GameKey) {
            const matchupLocked = lockedGames.includes(matchup.GameKey)
            return (
              <GameRow>
                <span
                  style={{
                    position: 'absolute',
                    margin: 'auto',
                    left: 0,
                    right: 0,
                    width: '25%',
                    textAlign: 'center',
                    fontSize: '12px',
                    backgroundColor: '#9ef01a'
                  }}
                  bg="primary"
                >
                  {moment(matchup.DateTime).format('ddd h a')}
                </span>
                <TeamSection
                  style={{
                    color:
                      matchup.pickedWinner === matchup.AwayTeam
                        ? teamColors[matchup.AwayTeam].text
                        : '',
                    backgroundColor:
                      matchup.pickedWinner === matchup.AwayTeam
                        ? teamColors[matchup.AwayTeam].bg
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
                  {matchupLocked ? (
                    <FontAwesomeIcon icon={solid('lock')} />
                  ) : (
                    '@'
                  )}
                </At>
                <TeamSection
                  style={{
                    color:
                      matchup.pickedWinner === matchup.HomeTeam
                        ? teamColors[matchup.HomeTeam].text
                        : '',
                    backgroundColor:
                      matchup.pickedWinner === matchup.HomeTeam
                        ? teamColors[matchup.HomeTeam].bg
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
  cursor: pointer;
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
