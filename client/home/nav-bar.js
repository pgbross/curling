import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/menu/menu-item.js';
import '@material/web/menu/menu.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/tabs.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { WithRouter } from '~/app/with-context.js';

const navMenuKeys = new Map([
  ['mydetails', { path: '/details' }],
  ['logout', { path: '/logout' }],
  ['help', { path: '/help' }],
  ['signin', {}],
]);

const onChoose = ({ target }) => {
  target.nextElementSibling?.show();
};

const NavBarBaseClass = WithRouter(LitElement, true);

class NavBar extends NavBarBaseClass {
  @property()
  accessor navTitle = 'Curling';

  @property({ type: Function })
  accessor goto;

  @property({ type: Array })
  accessor tabs = [];

  constructor() {
    super();

    this.selected = 1;
  }

  connectedCallback() {
    super.connectedCallback();

    // a hack to find the current route so the default selected tab is more likely to be correct
    const selectedTab = this.tabs.findIndex(({ path, match }) =>
      window.location.pathname.includes(match ?? path),
    );

    this.selected = selectedTab ?? 1;
  }

  render() {
    return html`
      <div class="navbar-container">
        <header class="top-app-bar admin-tabbar ">
          <div class="top-app-bar-row admin-tabbar-row">
            <section
              class="top-app-bar-section top-app-bar-section-align-start"
            >
              ${when(
                this.navTitle,
                () => html`<div class="top-app-bar-tla">${this.navTitle}</div>`,
              )}${this.renderTabs()}
            </section>

            <section class="top-app-bar-section top-app-bar-section-align-end">
              <div class="md-header-source"></div>

              <md-icon-button class="onc-icon-button"
                ><md-icon>help</md-icon></md-icon-button
              >

              <div style="position: relative">
                <md-icon-button id="anchor" class="onc-icon-button"
                  ><md-icon>account_circle</md-icon>
                </md-icon-button>
              </div>
            </section>
          </div>
        </header>
      </div>

      <div class="top-app-bar-fixed-adjust"></div>
    `;
  }

  renderTabs() {
    const items = [];

    for (const [index, tab] of this.tabs.entries()) {
      items.push(
        when(
          tab.icon,
          () =>
            html`<md-primary-tab
              inline-icon
              ?active=${index === this.selected}
              .item=${tab}
              ><md-icon slot="icon">home</md-icon></md-primary-tab
            >`,
          () =>
            html`<md-primary-tab ?active=${index === this.selected} .item=${tab}
              >${tab.label}</md-primary-tab
            > `,
        ),
      );
    }

    return html`
      <md-tabs
        class="admin-tabbar-tabs"
        @change="onTabsChange"
        @click=${this.onClick}
      >
        ${items}
      </md-tabs>
    `;
  }

  onClick = event => {
    const item = event.target.item;

    const name = item?.path;

    if (name) {
      const pathname =
        name === 'home' ? '/' : name.startsWith('/') ? name : `/${name}`;
      window.history.pushState({}, '', pathname);
      this.router.goto(pathname);
    }
  };
}
@customElement('nav-bar')
export class AppNavBar extends NavBar {
  static styles = css`
    .navbar-container {
      position: relative;
      z-index: 20;
      flex-shrink: 0;
    }

    .md-header-source {
      display: block;
      width: 5.7rem;
      max-width: 5.7rem;
      margin-left: 1.4rem;
    }

    .md-source {
      display: block;

      font-size: 0.65rem;
      line-height: 1.2;
      white-space: nowrap;

      backface-visibility: hidden;
      outline-color: var(--md-accent-fg-color);

      transition: opacity 0.25s;
    }

    .md-source-icon {
      display: inline-block;
      width: 2rem;
      height: 2.4rem;
      vertical-align: middle;
    }

    .md-source-repository {
      overflow: hidden;
      display: inline-block;

      max-width: calc(100% - 1.2rem);
      margin-left: -2rem;
      padding-left: 2rem;

      text-overflow: ellipsis;
      vertical-align: middle;
    }

    .md-source-facts {
      overflow: hidden;

      margin: 0.1rem 0 0;
      padding: 0;

      font-size: 0.55rem;
      list-style-type: none;

      opacity: 0.75;

      animation: facts 0.25s ease-in;
    }

    .md-source-fact {
      display: inline-block;
    }

    .md-icon svg {
      display: block;
      width: 1.2rem;
      height: 1.2rem;
      fill: currentcolor;
    }

    .md-source-icon svg {
      margin-top: 0.6rem;
    }

    [dir='ltr'] .md-source-icon svg {
      margin-left: 0.6rem;
    }

    .top-app-bar-tla {
      margin-left: 10px;
      font-family: var(--md-sys-typescale-headline-small-font);
      font-weight: var(--md-sys-typescale-headline-small-weight);
    }

    .top-app-bar-logo {
      width: 32px;
    }

    .top-app-bar .top-app-bar-logo {
      width: 32px;
    }

    .top-app-bar .top-app-bar-tla {
      margin-left: 10px;
      font-weight: 700;
    }

    @media only screen and (750px <= width) {
      .top-app-bar-narrow {
        display: none;
      }
    }

    @media only screen and (width > 750px) {
      .top-app-bar-wide {
        display: none;
      }
    }

    .top-app-bar {
      position: fixed;
      z-index: 4;

      display: flex;
      flex-direction: column;
      justify-content: space-between;

      box-sizing: border-box;
      width: 100%;

      color: #fff;

      background-color: #ffa219;
      background-color: var(--mdc-theme-primary, #ffa219);
    }

    .top-app-bar-dense .top-app-bar-row.admin-tabbar-row {
      height: 48px;
    }

    .admin-tabbar .admin-tabbar-tabs {
      --mdc-typography-button-font-size: 14px;
      --md-sys-color-on-surface-variant: white;
      --md-sys-color-surface: auto;
    }

    .admin-tabbar-tabs::part(divider) {
      --md-divider-color: #ffa219;
    }

    .top-app-bar-fixed-adjust {
      padding-top: 64px;
    }

    .top-app-bar-dense-fixed-adjust {
      padding-top: 48px;
    }

    .top-app-bar-row {
      position: relative;
      z-index: 1;

      display: flex;

      box-sizing: border-box;
      width: 100%;
      height: 64px;
    }

    .top-app-bar .top-app-bar-row:nth-of-type(1) {
      z-index: 2;
    }

    .top-app-bar-section-align-start {
      justify-content: flex-start;
      order: -1;
    }

    .top-app-bar-section-align-end {
      justify-content: flex-end;
      order: 1;
    }

    .top-app-bar-section {
      z-index: 1;

      display: inline-flex;
      flex: 1 1 auto;
      align-items: center;

      min-width: 0;
      padding: 8px 12px;
    }

    .onc-icon-button {
      --md-sys-color-on-surface-variant: white;
      --md-icon-font-variation-settings: 'FILL' 1;
    }

    .onc-link {
      cursor: pointer;
    }
  `;
}
