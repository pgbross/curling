import { animate, fadeIn, flyBelow } from '@lit-labs/motion';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/divider/divider.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';
import { shuffle } from '@ounce/onc';
import { saveAs } from 'file-saver';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '~/components/mini-uploader.js';

const onChoose = ({ target }) => {
  target.nextElementSibling?.show();
};

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
  'Crichton Tankard (Angus)': {
    years: {
      2024: {
        teams: [
          'Forfar 1',
          'Forfar 2',
          'Fotheringham 1',
          'Fotheringham 2',
          'Kirriemuir',
          'Suttieside',
        ],
      },
    },
  },
  'Crichton Tankard (Dundee)': {
    years: {
      2024: {
        teams: [
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

  @query('#competition-input') accessor selectCompetition;

  @query('#year-input') accessor selectYear;

  @query('#team-input') accessor selectTeam;

  /**
   * @type {{[key:string]: { years:{[year: string]:{teams:string[]}}}}}
   */
  @state() accessor data = data;

  @state() accessor count = 0;

  @state() accessor currentTeams = [];

  @state() accessor currentCompetition = 'Indoor Bonspiel';
  @state() accessor currentYear = '2024';

  @state() accessor team = '';

  @state() accessor showNewCompetition = false;
  @state() accessor showNewYear = false;
  @state() accessor showNewTeam = false;

  @state() accessor years;

  constructor() {
    super();

    this.competition = '';
    this.year = '';
  }

  duration = 500;

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

  willUpdate(changed) {
    if (changed.has('data')) {
      this.checkData();
    }

    if (changed.has('currentYear') || changed.has('currentCompetition')) {
      const competition = this.data[this.currentCompetition];

      const yearInfo =
        competition?.years[this.currentYear] ??
        (competition.years[this.currentYear] = { teams: [] });

      this.currentTeams = yearInfo.teams;
    }
  }

  render() {
    const competitions = [...this.competitions.values()];

    return html`<div class="main-wrapper">
      <!-- <div class="intro">Team shuffle</div> -->

      <div class="main">
        <div class="form-controls">
          <div class="selector-wrapper">
            <div class="competition-select">
              <md-outlined-select
                type="string"
                id="competition-input"
                class="pager-rows-per-page-select"
                @change=${this.onCompetitionChange}
                label="Competition"
              >
                ${repeat(
                  competitions,
                  comp => comp,
                  comp => {
                    return html`
                      <md-select-option
                        value="${comp}"
                        ?selected=${comp === this.currentCompetition}
                      >
                        <span slot="headline">${comp}</span>
                      </md-select-option>
                    `;
                  },
                )}
              </md-outlined-select>

              ${this.renderCompetitionChoice()}
            </div>

            <div class="competition-select">
              <md-outlined-select
                type="string"
                id="year-input"
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

              ${this.renderYearChoice()}
            </div>
          </div>

          <div>
            <md-text-button @click=${onChoose}
              ><md-icon slot="icon">upload</md-icon>Import data</md-text-button
            >
            <mini-uploader
              @upload=${this.onUpload}
              accept="*.json"
            ></mini-uploader>
            <md-text-button @click=${this.onExport}
              ><md-icon slot="icon">download</md-icon>Export
              data</md-text-button
            >
          </div>
        </div>

        <md-divider></md-divider>

        <div class="team-selector">
          <div class="competition-select">
            <md-outlined-select
              type="string"
              id="team-input"
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

            ${this.renderTeamChoice()}
          </div>
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

  renderCompetitionChoice() {
    return html`${this.renderAddCompetition()} ${this.renderNewCompetition()}`;
  }

  renderAddCompetition() {
    if (!this.showNewCompetition) {
      return html`
        <md-text-button @click=${() => (this.showNewCompetition = true)}
          >Add Competition</md-text-button
        >
      `;
    }
  }

  renderNewCompetition() {
    if (this.showNewCompetition) {
      return html` <div>
        <md-filled-text-field
          .value=${this.competition}
          label="New competition"
        ></md-filled-text-field>

        <md-filled-button icon="save_alt" @click=${this.onCompetition}
          >Save</md-filled-button
        >

        <md-text-button @click=${() => (this.showNewCompetition = false)}
          >Cancel</md-text-button
        >
      </div>`;
    }
  }

  renderYearChoice() {
    return html`${this.renderAddYear()} ${this.renderNewYear()}`;
  }

  renderAddYear() {
    if (!this.showNewYear) {
      return html`
        <md-text-button @click=${() => (this.showNewYear = true)}
          >Add Year</md-text-button
        >
      `;
    }
  }

  renderNewYear() {
    if (this.showNewYear) {
      return html` <div>
        <md-filled-text-field
          id="year-input"
          .value=${this.year}
          label="New year"
        ></md-filled-text-field>

        <md-filled-button icon="save_alt" @click=${this.onYear}
          >Save</md-filled-button
        >

        <md-text-button @click=${() => (this.showNewYear = false)}
          >Cancel</md-text-button
        >
      </div>`;
    }
  }

  renderTeamChoice() {
    return html`${this.renderAddTeam()} ${this.renderNewTeam()}`;
  }

  renderAddTeam() {
    if (!this.showNewTeam) {
      return html`
        <md-text-button
          ?disabled=${!this.currentYear}
          @click=${() => (this.showNewTeam = true)}
          >Add team</md-text-button
        >

        <md-filled-button
          @click=${this.onAddTeam}
          ?disabled=${!this.team || this.currentTeams.includes(this.team)}
          >Select Team</md-filled-button
        >
      `;
    }
  }

  renderNewTeam() {
    if (this.showNewTeam) {
      return html` <div>
        <md-filled-text-field
          id="team-input"
          .value=${this.team}
          label="New team"
        ></md-filled-text-field>

        <md-filled-button icon="save_alt" @click=${this.onTeam}
          >Add team</md-filled-button
        >

        <md-text-button @click=${() => (this.showNewTeam = false)}
          >Cancel</md-text-button
        >
      </div>`;
    }
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

  /**
   *
   * @param {Event&{target: Element&{previousElementSibling:{value:string}} }} param0
   */
  async onTeam({ target }) {
    const value = target.previousElementSibling?.value;

    if (!this.currentTeams.includes(value)) {
      this.data[this.currentCompetition].years[this.currentYear].teams.push(
        value,
      );
      this.checkData();
    }

    this.showNewTeam = false;

    await this.updateComplete;

    this.selectTeam.select(value);
  }

  onTeamChange({ target: { value } }) {
    this.team = value;
  }

  onCompetitionChange({ target: { value } }) {
    this.currentCompetition = value;
  }

  /**
   *
   * @param {Event&{target: Element&{previousElementSibling:{value:string}} }} param0
   */
  async onCompetition({ target }) {
    const value = target.previousElementSibling?.value;
    this.currentCompetition = value;
    if (!this.competitions.has(value)) {
      this.data[value] = { years: {} };
      this.checkData();
    }

    this.showNewCompetition = false;

    await this.updateComplete;

    this.selectCompetition.select(this.currentCompetition);
  }

  /**
   *
   * @param {Event&{target: Element&{previousElementSibling:{value:string}} }} param0
   */
  async onYear({ target }) {
    const value = target.previousElementSibling?.value;

    if (!this.years.has(value)) {
      this.data[this.currentCompetition].years[value] = { teams: [] };
      this.checkData();
    }

    this.currentYear = value;

    this.showNewYear = false;

    await this.updateComplete;

    this.selectYear.select(this.currentYear);
  }

  onYearChange({ target: { value } }) {
    this.currentYear = value;
  }

  onExport() {
    this.data[this.currentCompetition].years[this.currentYear].teams =
      this.currentTeams;

    const exportData = JSON.stringify(this.data, null, 2);
    const file = new File([exportData], `team-data.json`, {
      type: 'text/plain;charset=utf-8',
    });

    saveAs(file);
  }

  /**
   * @param {{ result: any; replace?: any; }} options
   */
  async handleFile(options) {
    const { result } = options;
    try {
      const data = JSON.parse(result.data);

      this.data = data;
      this.currentCompetition = Object.keys(data)[0];
      this.currentYear = Object.keys(
        this.data[this.currentCompetition].years,
      )[0];
      this.currentTeams = [];
      this.checkData();
    } catch (error) {
      console.log(error);
    }
  }

  async onUpload({ detail: { result } }) {
    if (!result || !(result.data && result.file)) {
      // return showErrors(result.message || result);
      console.log(result.message || result);
    }

    return this.handleFile({ result });
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

    .form-controls {
      display: flex;
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

    .selector-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      column-gap: 10px;
      row-gap: 10px;
      margin-bottom: 1em;
    }

    .team-selector {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      margin-bottom: 10px;
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

    .list-actions {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5em;
    }
  `;
}
