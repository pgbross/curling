import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  getCacheKeyForURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const navPath = getCacheKeyForURL('/client/evergreen/client.html')
  ? '/client/evergreen/client.html'
  : '/client/fallback/client.html';

const handler = createHandlerBoundToURL(navPath);
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/manifest/, /\/(api|welcome)/, /\/docs/],
});
registerRoute(navigationRoute);

registerRoute(
  // Cache API Request
  new RegExp('/api/(languages)'),
  new StaleWhileRevalidate({
    cacheName: 'apiCache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 60, // half an hour
      }),
    ],
  }),
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  }),
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  }),
);

self.addEventListener('message', event => {
  if (!event.data) {
    return;
  }

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLIENTS_CLAIM':
      self.clients.claim();
      break;
    default:
      // noop

      break;
  }
});
