// register-hooks.js
import { register } from 'node:module';

register('./loader.js', import.meta.url);
