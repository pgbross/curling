import { Router } from '@lit-labs/router';
import { ContextProvider } from '@lit/context';
import { routerContext } from './contexts.js';

/**
 * @typedef {import('lit').ReactiveControllerHost} ReactiveControllerHost
 * @typedef {import('lit').ReactiveElement} ReactiveElement
 */

export class RouterController {
  /**
   *
   * @param {ReactiveControllerHost & ReactiveElement} host
   */
  constructor(host, routes) {
    const provider = new ContextProvider(host, { context: routerContext });

    provider.setValue(this);

    this.router = new Router(host, routes);

    (this.host = host).addController(this);
  }

  /**
   * @param {string } pathname
   * @param {{ history: any; }} [options]
   */
  goto(pathname, options) {
    if (options?.history) {
      window.history.pushState({}, '', pathname);
    }
    this.router.goto(pathname);
  }

  outlet() {
    return this.router.outlet();
  }

  hostDisconnected() {}
}
