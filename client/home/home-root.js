import { Routes } from '@lit-labs/router';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { homeRoutes } from './home-routes.js';
import './nav-bar.js';

const tabList = [
  { label: 'Home', path: 'home', href: '/', icon: 'home' },
  {
    label: 'Team Shuffle',
    path: 'shuffle',
    match: 'project',
    role: 'projects:edit',
  },
];

class HomeRoot extends LitElement {
  constructor() {
    super();

    this.routes = new Routes(this, homeRoutes());

    this.title = `Curling`;
  }

  goto = (/** @type {string} */ pathname) => {
    window.history.pushState({}, '', pathname);
    this.routes.goto(pathname);
  };

  render() {
    const tabs = tabList;

    return html`
      <div class="app-projects">
        <nav-bar
          .navTitle=${this.title}
          .tabs=${tabs}
          .goto=${this.goto}
        ></nav-bar>
        ${this.routes.outlet()}
      </div>
    `;
  }
}
@customElement('home-root')
export class AppHomeRoot extends HomeRoot {
  static styles = css`
    .app-projects {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `;
}
