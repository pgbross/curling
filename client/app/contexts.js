import { createContext } from '@lit/context';

/**
 * @typedef {import('~/app/router-contoller.js').RouterController} RouterController
 * @typedef {{ log: (arg0: string) => void; }} Logger
 */

/**
 * @type {import('@lit/context').Context<Symbol, Logger>}
 */
export const loggerContext = createContext(Symbol.for('logger'));

/**
 * @type {import('@lit/context').Context<Symbol, RouterController>}
 */
export const routerContext = createContext(Symbol.for('router'));
