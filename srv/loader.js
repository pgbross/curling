import process from 'node:process';
import { pathToFileURL } from 'node:url';

const baseURL = pathToFileURL(process.cwd()).href;

const paths_ = {
  '@api': `${baseURL}/srv/api`,
  '@': `${baseURL}/srv`,
};

export async function resolve(specifier, parentModuleURL, defaultResolver) {
  if (
    specifier.startsWith('@') &&
    !specifier.startsWith('@ounce') &&
    !specifier.startsWith('@fastify') &&
    !specifier.startsWith('@ungap')
  ) {
    for (const [key, value] of Object.entries(paths_)) {
      if (specifier.startsWith(key)) {
        specifier = specifier.replace(key, value);
        break;
      }
    }
  }

  return defaultResolver(specifier, parentModuleURL);
}
