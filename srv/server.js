import { inspect } from 'node:util';
import { Program } from './engine/program.js';
import { routes } from './routes.js';

async function main() {
  try {
    const program = new Program();

    await program.init();

    // await program.register(databaseSetup);
    await program.register(routes);

    program.startServer();
  } catch (error) {
    console.warn(inspect(error));
    console.error('Error: failed to start website');
  }
}

await main();
