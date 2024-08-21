import { animate, fadeIn, flyBelow } from '@lit-labs/motion';
import '@material/web/button/filled-button.js';
import '@material/web/divider/divider.js';
import '@material/web/textfield/filled-text-field.js';
import { shuffle } from '@ounce/onc';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

class Shuffle extends LitElement {
  @property()
  accessor wiffle = false;

  @state()
  accessor oomph = false;

  @query('#team-input') accessor teamInput;

  @state() accessor teams = ['Test', 'Letham Grange', 'Kirriemuir', 'Forfar'];
  @state() accessor team = '';

  @state() accessor count = 0;

  constructor() {
    super();
  }

  duration = 500;

  render() {
    return html`<div class="main-wrapper">
      <div class="intro">Team shuffle</div>

      <div class="main">
        <div class="form-inputs">
          <md-filled-text-field
            id="team-input"
            .value=${this.team}
            label="Name"
            @input=${this.onTeam}
          ></md-filled-text-field>

          <md-filled-button @click=${this.onAddTeam} ?disabled=${!this.team}
            >Add Team</md-filled-button
          >
        </div>

        <md-divider></md-divider>
        <div class="team-list">
          <md-filled-button
            @click=${this.onShuffle}
            ?disabled=${this.teams.length < 2}
            >Shuffle</md-filled-button
          >
          <fieldset>
            <legend>Teams</legend>
            ${repeat(
              this.teams,
              team => team,
              (team, i) =>
                html` <div
                  class="item"
                  ${animate({
                    keyframeOptions: {
                      duration: this.duration,
                      delay: (i * this.duration) / this.teams.length,
                      fill: 'both',
                    },
                    in: fadeIn,
                    out: flyBelow,
                  })}
                >
                  <div class="name">${team}</div>
                </div>`,
            )}
          </fieldset>
        </div>
      </div>

      <div class="footer">&copy; Curling ~ 2024</div>
    </div> `;
  }

  onShuffle() {
    this.teams = shuffle.getRandomSubarray(this.teams);
  }

  onAddTeam() {
    this.teams.push(this.team);
    this.team = '';
  }

  onTeam({ target: { value } }) {
    this.team = value;
  }
}

@customElement('team-shuffle')
export class TeamShuffle extends Shuffle {
  static styles = css`
    .main-wrapper {
      display: flex;
      flex-direction: column;

      height: 100vh;
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

      width: 50%;
      margin-bottom: 1em;
    }

    .team-list {
      width: 50%;
      margin-left: 2em;
      margin-top: 2em;
    }

    .item {
      height: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-inline: 16px;
      box-sizing: border-box;
      font-family: arial;
      border: 1px solid black;
      background-color: white;

      text-align: center;
      flex: 1;
      background: #ef5350;
      padding: 16px;
      border: 4px solid #b61827;
      border-radius: 8px;
      margin: 8px;
      min-width: 100px;
    }

    .item .name {
      font-size: 20px;
    }
  `;
}
