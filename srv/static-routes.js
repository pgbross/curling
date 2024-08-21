import fastifyStatic from '@fastify/static';
import serverConfig from 'config';
import mime from 'mime-types';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {import('fastify').FastifyInstance} FastifyInstance
 */
/**
 *
 * @param {String} relativePath
 * @returns
 */
const resolve = relativePath => fileURLToPath(new URL(relativePath, import.meta.url));

// determine if we are using nginx to offload static files
/**
 * @type {{ nginx: {offloading: boolean}, paths: {STATIC_PATH: string, BUILD_PATH: string}}}
 */
const {
  nginx: { offloading = true },
  paths: { STATIC_PATH, BUILD_PATH },
} = /** @type {*} */ (serverConfig);

/**
 *
 * @param {FastifyInstance} fastify
 * @param {{maxAge?: string}} param1
 * @param {*} next
 */
export const staticRoutes = function (fastify, { maxAge = '5m' } = {}, next) {
  // for development and debugging need to send files from the build directory.
  if (!offloading) {
    fastify.register(fastifyStatic, {
      root: [resolve(path.join('..', STATIC_PATH)), resolve(path.join('..', BUILD_PATH))],
      prefix: '/',
      maxAge,
      setHeaders: (
        /** @type {{ setHeader: (arg0: string, arg1: string) => void; }} */ response,
        /** @type {string} */ path,
      ) => {
        const mimeType = mime.lookup(path);
        if (mimeType && mimeType.startsWith('image/')) {
          response.setHeader('Cache-Control', 'public, max-age=86400');
        }
      },
      decorateReply: false,
    });
  }

  next();
};
