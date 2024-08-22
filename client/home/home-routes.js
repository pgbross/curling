import { html } from 'lit';

/**
 *
 * @returns {import('@lit-labs/router').RouteConfig[]}
 */
export const homeRoutes = () => [
  {
    path: '',
    render: () => html`<app-home></app-home>`,
    enter: async () => {
      await import('./home.js');
      return true;
    },
  },
  {
    path: 'shuffle',
    render: () => html`<team-shuffle></team-shuffle>`,
    enter: async () => {
      await import('~/team/team-shuffle.js');
      return true;
    },
  },
];
