import { html, render } from 'lit';
import '~/app/app-root.js';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async function main() {
  // @ts-ignore: Property 'UrlPattern' does not exist
  if (!globalThis.URLPattern) {
    await import('urlpattern-polyfill');
  }

  render(html` <app-root></app-root> `, document.body);
})();
