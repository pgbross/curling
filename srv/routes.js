import fastifyAccepts from '@fastify/accepts';
import appRoot from 'app-root-path';
import serverConfig from 'config';
import fileUpload from 'fastify-file-upload';
import middie from 'middie';
import fs from 'node:fs';
import { readFile as fsReadFile } from 'node:fs/promises';
import path from 'node:path';
// import { auth, databasePlugin } from './api/index.js';
// import { MyUsers } from './db-user.js';
import { logger } from './engine/logger.js';
// import rbacPlugin from './rbac-middle.js';
// import { roles } from './roles.js';
// import apiRoutes from './routes-api.js';
// import { handleLogin, sessionRegister } from './session.js';
import { staticRoutes } from './static-routes.js';

/**
 * @typedef {import('fastify').FastifyInstance} FastifyInstance
 * @typedef {import('fastify').FastifyReply} FastifyReply
 * @typedef {import('fastify').FastifyRequest} FastifyRequest
 */

const {
  // @ts-ignore
  paths: { STATIC_PATH, BUILD_PATH },
} = serverConfig;
const cleanupName_ = path.resolve(STATIC_PATH, 'cleanup.html');

async function getRole(request) {
  return request.user && request.user.role;
}

/**
 *
 * @param {FastifyInstance} fastify
 * @param {*} options
 * @param {*} next
 */
export const routes = async function (fastify, options = {}, next) {
  const { maxAge = '5m' } = options;

  logger.debug('routes: start');

  await fastify.register(fastifyAccepts);

  const secret = await fsReadFile(
    path.join(appRoot.path, 'config/secret-key'),
    'utf-8',
  );

  await fastify.register(middie);
  await fastify.register(fileUpload);

  // setup static routes (static-routes.js will check for offloading to nginx)
  await fastify.register(staticRoutes, { maxAge });

  await fastify.get('/manifestclean', (request, reply) => {
    reply.header('Clear-Site-Data', '"cache", "cookies", "storage"');
    reply.header(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    );
    const stream = fs.createReadStream(cleanupName_);
    reply.type('text/html').send(stream);
  });

  // // serve api requests
  // await apiRoutes(fastify);

  // check for service worker script and redirect to the one for the appropriate build
  // any navigation route that gets here needs to be served as admin or client as needed
  fastify.setNotFoundHandler((request, reply) => {
    const match = request.url.match(/(sw-admin\.js(\.map)?)/);
    const ua = request.headers['user-agent'];
    const ap = 'evergreen/'; //getAssetPath(ua);

    if (match) {
      // request from old sw, so clean the manifest
      reply.header('Clear-Site-Data', '"cache", "cookies", "storage"');
      reply.header(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      );
      const stream = fs.createReadStream(cleanupName_);
      reply.type('text/html').send(stream);
    } else if (path.extname(request.url).length === 0) {
      // check for navigation route (ie. no extension)

      const filepath = path.resolve(
        path.join(BUILD_PATH, 'client', ap, 'client.html'),
      );
      const stream = fs.createReadStream(filepath);
      reply.type('text/html').send(stream);
    } else {
      return reply.status(404).send(new Error('Not found'));
    }
  });

  next();
};
