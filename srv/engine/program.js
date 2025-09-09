import serverConfig from 'config';
import util from 'node:util';
import { initLogger, logger } from './logger.js';
import { ServerController } from './server-controller.js';

export class Program {
  async init() {
    try {
      // @ts-ignore
      const { helmet, cors, logLevel = 'info' } = serverConfig;

      // create a logger for non-http middleware
      initLogger({ level: logLevel });

      this.fastify = await ServerController.createServer({
        helmet,
        cors,
        logLevel,
        // dbConfig: databaseConfig,
      });
    } catch (error) {
      console.warn(util.inspect(error));
      throw new Error('Error: failed to initialise website');
    }
  }

  async register(plugin, options) {
    await this.fastify.register(plugin, options);
  }

  async registerPlugins(plugins) {
    for await (const pluginOrConfig of plugins) {
      const { plugin, options } = pluginOrConfig.plugin
        ? pluginOrConfig
        : { plugin: pluginOrConfig };
      await this.fastify.register(plugin, options);
    }
  }

  startServer() {
    const { PORT: port, SSLPORT: sslPort, listenOn } = serverConfig;
    ServerController.startServer(this.fastify, { port, sslPort, listenOn });
  }

  async shutdown() {
    ServerController.stopServer().then(() => {
      // database.dispose();
      logger.info('server is stopping');
    });
  }
}
