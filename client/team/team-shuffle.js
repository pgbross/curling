import { animate, fadeIn, flyBelow } from '@lit-labs/motion';
import '@material/web/button/filled-button.js';
import '@material/web/divider/divider.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';
import { shuffle } from '@ounce/onc';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

/**
 * @type {{[key:string]: { years:{[year: string]:{teams:string[]}}}}}
 */
const data = {
  'Indoor Bonspiel': {
    years: {
      2024: {
        teams: [
          'AWW',
          'Banchory',
          'Caterthun',
          'Dun',
          'Evenie Water',
          'Fettercairn',
          'Letham Grange',
          'Forfar 1',
          'Fotheringham 1',
          'Kirriemuir',
          'Suttieside',
          'Broughty ferry',
          'Lundie & Auchterhouse',
          'Panmure',
          'Pitkerro',
          'University of Dundee',
        ],
      },
    },
  },
  'Inter Province': {
    years: {
      2024: {
        teams: [
          'Caterthun',
          'Dalhousie',
          'Dun',
          'Edzell',
          'Evenie Water',
          'Letham Grange',
          'Forfar 1',
          'Suttieside',
          'Broughty ferry',
        ],
      },
    },
  },
  'Grant Trophy': {
    years: {
      2024: {
        teams: [
          'AWW',
          'Banchory',
          'Caterthun',
          'Dalhousie',
          'Dun',
          'Edzell',
          'Evenie Water',
          'Letham Grange',
          'Forfar 1',
          'Fotheringham 1',
          'Kirriemuir',
          'Suttieside',
          'Broughty ferry',
          'Claverhouse',
          'Pitkerro',
          'University of Dundee',
        ],
      },
    },
  },
  'Crichton Tankard (N)': {
    years: {
      2024: { teams: ['AWW', 'Caterthun', 'Evenie Water', 'Letham Grange'] },
    },
  },
  'Crichton Tankard (S)': {
    years: {
      2024: {
        teams: [
          'Forfar 1',
          'Forfar 2',
          'Fotheringham 1',
          'Fotheringham 2',
          'Kirriemuir',
          'Suttieside',
          'Balruddery',
          'Claverhouse',
          'Dundee',
          'Lundie & Auchterhouse',
          'Pitkerro',
          'University of Dundee',
        ],
      },
    },
  },
};

class Shuffle extends LitElement {
  @property()
  accessor wiffle = false;

  @state()
  accessor oomph = false;

  @query('#team-input') accessor teamInput;

  /**
   * @type {{[key:string]: { years:{[year: string]:{teams:string[]}}}}}
   */
  @state() accessor data = data;

  @state() accessor count = 0;

  @state() accessor currentTeams = [];

  @state() accessor currentCompetition = 'Indoor Bonspiel';
  @state() accessor currentYear = '2024';

  @state() accessor team = '';

  constructor() {
    super();
  }

  duration = 500;

  willUpdate(changed) {
    if (changed.has('data')) {
      this.checkData();
    }

    if (changed.has('currentYear') || changed.has('currentCompetition')) {
      const competition = this.data[this.currentCompetition];

      const yearInfo = competition?.years[this.currentYear];

      if (yearInfo) {
        this.currentTeams = yearInfo.teams;
      }
    }
  }

  render() {
    return html`<div class="main-wrapper">
      <!-- <div class="intro">Team shuffle</div> -->

      <div class="main">
        <div class="form-inputs">
          <div class="selector-wrapper">
            <div class="competition-select">
              <md-outlined-select
                type="string"
                class="pager-rows-per-page-select"
                @change=${this.onCompetitionChange}
                label="Competition"
              >
                ${[...this.competitions.values()].map(
                  name => html`
                    <md-select-option
                      value="${name}"
                      ?selected=${name === this.currentCompetition}
                    >
                      <span slot="headline">${name}</span>
                    </md-select-option>
                  `,
                )}
              </md-outlined-select>

              <md-filled-text-field
                id="team-input"
                .value=${this.currentCompetition}
                label="New competition"
                @input=${this.onCompetition}
              ></md-filled-text-field>
            </div>

            <div class="competition-select">
              <md-outlined-select
                type="string"
                ?disabled=${!this.currentCompetition}
                class="pager-rows-per-page-select"
                @change=${this.onYearChange}
                label="Year"
              >
                ${[...this.years.values()].map(
                  year => html`
                    <md-select-option
                      value="${year}"
                      ?selected=${year === this.currentYear}
                    >
                      <span slot="headline">${year}</span>
                    </md-select-option>
                  `,
                )}
              </md-outlined-select>

              <md-filled-text-field
                id="year-input"
                ?disabled=${!this.currentCompetition}
                .value=${this.currentYear}
                label="New year"
                @input=${this.onYear}
              ></md-filled-text-field>
            </div>
          </div>

          <md-divider></md-divider>

          <div class="competition-select">
            <md-outlined-select
              type="string"
              ?disabled=${!this.currentYear}
              class="pager-rows-per-page-select"
              @change=${this.onTeamChange}
              label="Team"
            >
              ${[...this.teams.values()]
                .filter(team => !this.currentTeams.includes(team))
                .map(
                  team => html`
                    <md-select-option value="${team}">
                      <span slot="headline">${team}</span>
                    </md-select-option>
                  `,
                )}
            </md-outlined-select>

            <md-filled-text-field
              id="year-input"
              ?disabled=${!this.currentYear}
              .value=${this.team}
              label="New team"
              @input=${this.onTeam}
            ></md-filled-text-field>
          </div>

          <md-filled-button
            @click=${this.onAddTeam}
            ?disabled=${!this.team || this.currentTeams.includes(this.team)}
            >Add Team</md-filled-button
          >
        </div>

        <md-divider></md-divider>
        <div class="team-list">
          <div class="list-actions">
            <md-filled-button
              @click=${this.onShuffle}
              ?disabled=${this.currentTeams.length < 2}
              >Shuffle</md-filled-button
            >

            <div>#Teams: ${this.currentTeams.length}</div>
          </div>
          <fieldset>
            <legend>Teams</legend>
            ${repeat(
              this.currentTeams,
              team => team,
              (team, i) =>
                html` <div
                  class="item"
                  ${animate({
                    keyframeOptions: {
                      duration: this.duration,
                      delay: (i * this.duration) / this.currentTeams.length,
                      fill: 'both',
                    },
                    in: fadeIn,
                    out: flyBelow,
                  })}
                >
                  <div class="name">${team}</div>
                  <div class="item-action">
                    <md-icon-button @click=${() => this.onRemoveTeam(team)}
                      ><md-icon>do_not_disturb_on</md-icon></md-icon-button
                    >
                  </div>
                </div>`,
            )}
          </fieldset>
        </div>
      </div>

      <div class="footer">&copy; Curling ~ 2024</div>
    </div> `;
  }

  checkData() {
    const years = new Set();
    const teams = new Set();
    const competitions = new Set();

    for (const [key, competition] of Object.entries(this.data)) {
      competitions.add(key);

      for (const [year, item] of Object.entries(competition.years)) {
        years.add(year);

        for (const team of item.teams) {
          teams.add(team);
        }
      }
    }
    this.years = years;
    this.teams = teams;
    this.competitions = competitions;
  }

  onShuffle() {
    this.currentTeams = shuffle.getRandomSubarray(this.currentTeams);
  }

  onRemoveTeam(team) {
    this.currentTeams = this.currentTeams.filter(ct => ct !== team);
  }

  onAddTeam() {
    this.currentTeams.push(this.team);
    this.team = '';
  }

  onTeam({ target: { value } }) {
    this.team = value;
  }

  onTeamChange({ target: { value } }) {
    this.team = value;
  }

  onCompetitionChange({ target: { value } }) {
    this.currentCompetition = value;
  }

  onCompetition({ target: { value } }) {
    this.currentCompetition = value;
  }

  onYear({ target: { value } }) {
    this.currentYear = value;
  }

  onYearChange({ target: { value } }) {
    this.currentYear = value;
  }
}

@customElement('team-shuffle')
export class TeamShuffle extends Shuffle {
  static styles = css`
    .main-wrapper {
      display: flex;
      flex-direction: column;

      height: 100vh;

      margin-top: 1em;
    }

    .main {
      flex: 1;
    }

    .footer {
      padding: 10px;
      background: #ccc;
    }

    .form-inputs {
      font-family: sans-serif;
      margin-block-end: 16px;
      gap: 8px;
      display: flex;
      flex-direction: column;

      width: 70%;
      margin-bottom: 1em;
    }

    .team-list {
      width: 50%;
      margin-left: 2em;
      margin-top: 2em;
    }

    .item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline: 8px;
      box-sizing: border-box;
      font-family: arial;
      text-align: center;
      flex: 1;
      background: #ef5350;
      padding: 16px;
      border: 4px solid #b61827;
      border-radius: 8px;
      margin: 8px;
      min-width: 80px;
    }

    .item .name {
      font-size: 20px;
      flex: 1;
    }

    .competition-select {
      display: flex;
      gap: 10px;
    }

    .selector-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
    }

    .list-actions {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5em;
    }
  `;
}
