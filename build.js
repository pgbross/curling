import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import * as esbuild from 'esbuild';
import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import meow from 'meow';
import {
  access,
  constants,
  copyFile,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { rimraf } from 'rimraf';
import stringHash from 'string-hash';
import { injectManifest } from 'workbox-build';
import { buildDefine } from './build-defines.js';

const booleanFlags = ['minify', 'watch', 'sw', 'code'];

const parameters = meow(helpText(), {
  importMeta: import.meta,
  boolean: booleanFlags,
  flags: { target: { isMultiple: true } },
});

const base = './build';
const assetsDirectory = './assets';
const copyList = [];
const targetPaths = { es2022: 'evergreen' };
const entryPoints = ['./client/main.js', './client/css/style.scss'];

await app(parameters);

async function app(cli) {
  try {
    cli.flags = validateFlags(cli.flags);

    if (cli.flags.sourcemap === 'true') {
      cli.flags.sourcemap = true;
    } else if (cli.flags.sourcemap === 'false') {
      cli.flags.sourcemap = false;
    }

    const {
      pkg,
      flags: {
        target = 'es2022',
        sourcemap = true,
        minify = false,
        watch = false,
        sw = false,
        code = true,
        assets = false,
      },
    } = cli;

    if (Array.isArray(target) && target.length > 1 && watch) {
      console.log('Cannot have multiple targets and watch at the same time');
      return;
    }

    if (sw && watch) {
      console.log('Cannot have service worker and watch at the same time');
      return;
    }

    const targets = Array.isArray(target) ? target : [target];

    await buildAssets(assets);

    await copyAssets(copyList);

    for (const buildTarget of targets) {
      await build(buildTarget, { sourcemap, minify, watch, sw, code }, pkg);
    }
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

function helpText() {
  return `Usage:
$ build  [options]

Options:
  [--sourcemap = true]
    A source map is generated into a separate .js.map output file alongside the .js output file

  [--minify = false]

    When enabled, the generated code will be minified instead of pretty-printed

  [--target = es2020]
    This sets the target environment for the generated JavaScript and/or CSS code

  [--watch = false]
    Runs esbuild in watch mode for development

  [--sw = false]
    Builds service-worker

  [--code = true]
    Builds the main application code
`;
}

function validateFlags(flags) {
  const validated = { ...flags };

  for (const key of booleanFlags) {
    if (typeof validated[key] === 'string') {
      validated[key] = validated[key] === 'true' ? true : false;
    }
  }
  return validated;
}

async function checkAccess(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 *
 * @param {string[]} assetList
 */
async function copyAssets(assetList) {
  for (const specifier of assetList) {
    const dependency = await import.meta.resolve(specifier);

    console.log(dependency);

    const source = fileURLToPath(dependency);
    const destinationFile = specifier.endsWith('/index.js')
      ? `${specifier.slice(0, -9)}.js`
      : specifier.endsWith('/standalone.js')
        ? `${specifier.slice(0, -14)}.js`
        : `${specifier}.js`;
    const destination = `${base}/client/assets/${destinationFile}`;

    if (!(await checkAccess(destination))) {
      await copyFile(source, destination);
    }
  }
}

async function buildAssets(assets) {
  const files = await readdir(assetsDirectory);

  const destinationBase = `${base}/client/assets`;
  const sources = [];
  for (const file of files) {
    const destination = path.join(destinationBase, file);

    if (assets || !(await checkAccess(destination))) {
      // assume we have to build the asset if it not accessible (ie. probably not there)
      sources.push(path.join(assetsDirectory, file));
    }
  }

  if (sources.length > 0) {
    await esbuild.build({
      entryPoints: sources,
      outdir: `${base}/client/assets`,
      bundle: true,
      minify: true,
      format: 'esm',
      logLevel: 'info',
    });
  }

  return true;
}

async function build(target, { watch, minify, sourcemap, sw, code }, package_) {
  const { version } = package_;

  const extraPath = targetPaths[target] ?? targetPaths.es2022;
  const templatePath =
    extraPath === 'evergreen'
      ? './template/client.html'
      : `./template/client-fallback.html`;
  const outdir = `${base}/client/${extraPath}`;

  const define = { __VERSION__: `'${version}'` };

  if (code) {
    await rimraf(outdir);

    const function_ = watch ? esbuild.context : esbuild.build;

    const contextOrResult = await function_({
      entryPoints,
      target: [target],
      // outfile,
      metafile: true,
      outdir,
      minify,
      sourcemap,
      bundle: true,
      format: 'esm',
      splitting: true,
      chunkNames: 'chunks/[name]-[hash]',
      entryNames: '[name]-[hash]',
      loader: {
        '.html': 'text',
        '.worklet.js': 'binary',
        '.worker.js': 'dataurl',
      },
      tsconfig: 'esbuild-tsconfig.json',
      external: [
        'vanilla-jsoneditor',
        '@zip.js/zip.js',
        'xlsx-js-style',
        'xlsx',
      ],
      publicPath: `/client/${extraPath}/`,
      plugins: [
        sassPlugin({
          filter: /style\.scss$/,
        }),

        sassPlugin({
          filter: /module\.(s(a|c)ss)$/,
          transform: postcssModules({
            generateScopedName: (name, filename, css) => {
              const extension = path.extname(filename);
              const file = path
                .basename(filename, `${extension}`)
                .replace(/\.module$/, '');
              const hash = stringHash(css).toString(36).slice(0, 5);
              return `_${file}_${name}_${hash}`;
            },
          }),
        }),
        sassPlugin({
          type: 'lit-css',
        }),

        htmlPlugin({
          files: [
            {
              filename: 'client.html',
              entryPoints: ['client/main.js', 'client/css/style.scss'],
              htmlTemplate: templatePath,
              scriptLoading: 'module',
            },
          ],
        }),
      ],
      logLevel: 'info',
      define: { ...define, ...buildDefine },
    });

    if (watch) {
      await contextOrResult.watch();
    }
  }

  if (sw) {
    await buildSW({ target, extraPath, outdir });
  }
}

async function buildSW({ target, extraPath, outdir }) {
  const outfile =
    target === 'es2018'
      ? `${base}/sw-client-fallback.js`
      : `${base}/sw-client.js`;

  await esbuild.build({
    entryPoints: ['./client/sw-client.source.js'],
    outfile,
    minify: false,
    bundle: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  const { warnings } = await injectManifest({
    dontCacheBustURLsMatching: /-[\dA-Z]{8,20}\./,
    globDirectory: base,
    globPatterns: [
      `client/${extraPath}/**/*.{js,css,html}`,
      // 'client/assets/**/*.{js,css,html}',
    ],
    swDest: outfile,
    swSrc: outfile,
    maximumFileSizeToCacheInBytes: 10_000_000, // 10MB
    modifyURLPrefix: {
      '': `/`,
    },
  });

  if (warnings?.length > 0) {
    console.log(warnings);
  }

  if (target !== 'es2018') {
    await processPackageJson(outdir);
  }
}

async function processPackageJson(outdir) {
  const content = await readFile('./package.json', { encoding: 'utf8' });

  const jsonContent = JSON.parse(content);

  const {
    config,
    scripts,
    devDependencies,
    'standard-version': sv,
    'lint-staged': ls,
    husky,
    browserslist,
    jest,
    commitlint,
    prettier,
    eslintConfig,
    wireit,
    ...rest
  } = jsonContent;
  const packageContent = JSON.stringify(rest, undefined, 2);

  await writeFile(`${outdir}/package.json`, packageContent, {
    encoding: 'utf8',
  });
}
