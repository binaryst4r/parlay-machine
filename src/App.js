import React, {Component} from 'react';
import logo from './logo.svg';
import styled, {css} from 'styled-components'
import _ from 'lodash'
import './App.css';

class App extends Component {
  state = {
    schedule: [],
    showWeek: 5
  }

  componentDidMount() {
    fetch('https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2020', {
      headers: {
        "Ocp-Apim-Subscription-Key": "df7642467cd4482cb377b5a0ead73dda"
      }
    })
    .then(response => response.json())
    .then(data => {
      this.setState({
        schedule: data
      })
    })
  }

  render() {
    const {schedule, showWeek} = this.state
    let scheduleByWeek
    if (schedule.length) {
      scheduleByWeek = _.groupBy(schedule, 'Week')
    }

    console.log(scheduleByWeek)
    return (
      <div className="App">
        <select value={showWeek} onChange={(e) => this.setState({showWeek: e.target.value})}>
          <option>
            Select Week
          </option>
          {_.keys(scheduleByWeek).map(week => (
            <option value={week}>Week {week}</option>
          ))}
        </select>
        {showWeek && scheduleByWeek &&
          <ParlayContainer>
            <VerticalDivider />
            {scheduleByWeek[showWeek].map((game, i) => {
              if (game.GameKey) {
                return (
                  <GameRow>
                    <TeamSection>
                      {game.AwayTeam} <br />
                      <Odds>{game.AwayTeamMoneyLine > 0 ? `+${game.AwayTeamMoneyLine}` : game.AwayTeamMoneyLine}</Odds>
                    </TeamSection>
                    <At>@</At>
                    <TeamSection>
                      {game.HomeTeam}<br />
                      <Odds>{game.HomeTeamMoneyLine > 0 ? `+${game.HomeTeamMoneyLine}` : game.HomeTeamMoneyLine}</Odds>
                    </TeamSection>
                  </GameRow>
                )
              }
              return null
            })}
            <OddsContainer>
              Odds
            </OddsContainer>
          </ParlayContainer>
        }
      </div>
    );
  }
}

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
  font-size: 13px;
  width: 50%;
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
`
const GameRow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const ParlayContainer = styled.div`
  position: relative;
  width: 70vmin;
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

export default App;
