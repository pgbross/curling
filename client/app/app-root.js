import { Task } from '@lit/task';
import { shuffle } from '@ounce/onc';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import seedrandom from 'seedrandom';
import { RouterController } from './router-contoller.js';

export class AppRoot extends LitElement {
  @state()
  accessor ready = false;

  constructor() {
    super();

    const routes = [
      {
        path: '/',
        render: () => html`<app-home></app-home>`,
        enter: async () => {
          await import('../home/home.js');
          return true;
        },
      },
      {
        path: '/shuffle',
        render: () => html`<team-shuffle></team-shuffle>`,
        enter: async () => {
          await import('~/team/team-shuffle.js');
          return true;
        },
      },
    ];

    this.routerController = new RouterController(this, routes);

    // @ts-ignore
    window.__router = this.routerController;

    this.logger = {
      log: message => {
        console.log(`[app-root] ${message}`);
      },
    };

    const rng = seedrandom();
    shuffle.setRng(rng);

    this.task = new Task(this, {
      task: async () => {},
      args: () => [],
    });
  }

  connectedCallback() {
    super.connectedCallback();

    const appElement = document.querySelector('#app');
    appElement.remove();
  }

  render() {
    return this.task.render({
      pending: () => html`<div class="home-splash">Initialising...</div>`,
      complete: () => this.routerController.outlet(),
      error: error => html`<pre>${error.toString}</pre>`,
    });
  }
}

@customElement('app-root')
export class OncAppRoot extends AppRoot {
  static styles = css`
    .home-splash {
      visibility: hidden;
      opacity: 0;

      animation: fade-in 1s;
      animation-fill-mode: forwards;
      animation-delay: 1s;
    }

    @keyframes fade-in {
      0% {
        visibility: hidden;
        opacity: 0;
      }

      100% {
        visibility: visible;
        opacity: 1;
      }
    }
  `;
}
