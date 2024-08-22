import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { WithRouter } from '~/app/with-context.js';

/**
 * @typedef {import('~/app/contexts.js').RouterController} RouterController
 */

const HomeBaseClass = WithRouter(LitElement, true);

class Home extends HomeBaseClass {
  @property()
  accessor wiffle = false;

  @state()
  accessor oomph = false;

  constructor() {
    super();
  }

  render() {
    return html`<div class="main-wrapper">
      <img
        src="/media/curling-banner.jpg"
        alt="Curling Banner"
        name="Banner"
        id="Banner"
        class="banner-image"
      />

      <div class="home-intro">
        <p>
          Welcome to the Curling Website, a collection of Curling related
          utilies.
        </p>
      </div>

      <div class="home-main">
        <ul class="nav-list">
          <li @click=${this.onShuffle} class="nav-list-item">
            Team shuffler - Randomise a team list
          </li>
        </ul>
      </div>

      <div class="footer">&copy; Curling ~ 2024</div>
    </div> `;
  }

  onShuffle() {
    this.router.goto('/shuffle', { history: true });
  }
}

@customElement('app-home')
export class AppHome extends Home {
  static styles = css`
    .main-wrapper {
      display: flex;
      flex-direction: column;

      height: 100vh;
    }

    .banner-image {
      border: 1px solid #666;
      width: 100%;
      height: auto;
      object-fit: cover;
      max-height: 150px;
    }

    .home-main {
      flex: 1;
    }

    .nav-list {
      list-style-type: none;
    }
    .nav-list-item {
      cursor: pointer;
    }

    .footer {
      padding: 10px;
      background: #ccc;
    }
  `;
}
