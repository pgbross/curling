import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { routerContext } from './contexts.js';

/**
 * @template T
 * @typedef {new (...args: any[])=>T} Constructor<T=Object>
 */

/**
 * @typedef {import('~/app/contexts.js').RouterController} RouterController
 */

/**
 * @template T
 * @param {T & Constructor<LitElement>} superclass
 * @param {Boolean} [subscribe]
 */
export function WithRouter(superclass, subscribe) {
  class WithRouter extends superclass {
    /**
     * @type {RouterController}
     */
    @consume({ context: routerContext, subscribe })
    accessor router;
  }

  return WithRouter;
}
