// eslint-disable-next-line no-undef
module.exports = {
  helmet: {
    referrerPolicy: {
      policy: 'no-referrer-when-downgrade',
    },
    crossOriginOpenerPolicy: {
      policy: 'same-origin-allow-popups',
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          `'self'`,
          `blob:`,
          `fonts.googleapis.com`,
          `fonts.gstatic.com`,
          'api.pwnedpasswords.com',
        ],
        scriptSrc: [
          `'self'`,
          `'unsafe-inline'`,
          `'unsafe-eval'`,
          '*.ounce.ac',
          'ajax.googleapis.com',
          'storage.googleapis.com',
          'www.google-analytics.com',
          'accounts.google.com',
          `connect.facebook.net`,
          `blob:`,
          `data:`,
        ],
        connectSrc: [
          `'self'`,
          `blob:`,
          `fonts.googleapis.com`,
          `fonts.gstatic.com`,
          'api.pwnedpasswords.com',
          `accounts.google.com`,
          `connect.facebook.net`,
          `www.facebook.com/x/oauth/status`,
          `www.facebook.com`,
          `graph.facebook.com`,
        ],
        workerSrc: [
          'localhost',
          `data:`,
          `blob:`,
          `'self'`,
          `'unsafe-inline'`,
          `'unsafe-eval'`,
          '*.ounce.ac',
        ],
        mediaSrc: [`blob: `, `'self'`],
        frameSrc: [`accounts.google.com`, `www.facebook.com`],
        fontSrc: [`*`],
        imgSrc: [`* blob: data:`],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          `fonts.googleapis.com`,
          `accounts.google.com`,
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  },
  jsonErrors: true,
  paths: {
    STATIC_PATH: './static',
    BUILD_PATH: './build',
  },
  favpath: './static/favicon.ico',
  mediaPath: './static/media',
  bcryptRounds: 5,
  ProjectName: 'curling',
  ProductName: 'CURLING',
  PORT: 2300,
  listenOn: '0.0.0.0',
  // SSLPORT:2321
  //
  // SRV
  //
  cors: 'http://localhost:2300',

  //
  // SMTP
  SMTP_HOST: 'localhost',
  SMTP_FROM_NAME: 'CURLING website',
  SMTP_FROM_ADDRESS: 'website@curling.ounce.ac',
  SMTP_SSL: false,
  // SMTP_PICKUP: '../pickup',
  SMTP_TO_ADDRESS: 'philip@satchel.scot, pgbross@hotmail.com',
  sendMail: {
    templateDir: './srv/templates',
    inviteTemplate: 'invite',
    resetTemplate: 'reset',
    signupTemplate: 'signup',
    locales: ['en', 'de'],
    fallbacks: { 'de-*': 'de' },
    localePath: './static/locales',
  },
  nginx: { offloading: false },
  // logDestination: 'pino.log',
  logLevel: 'info',
  // pidFile: '/tmp/plus.pid',

  schema_urn: 'curling.ounce.ac',
};
