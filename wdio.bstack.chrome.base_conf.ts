import { config as baseConfig } from './wdio.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  // =====================
  // BrowserStack Settings
  // =====================
  user: '',
  key: '',

  services: ['browserstack'],
  hostname: 'hub.browserstack.com',
  port: 443,
  path: '/wd/hub',

  // Override base settings for BrowserStack
  maxInstances: 3,
  waitforTimeout: 80000,
  connectionRetryTimeout: 360000,
  outputDir: './reports',

  capabilities: [{
    browserName: 'chrome',
    'bstack:options': {
      os: 'Windows',
      sessionName: 'Journey Regression Test',
      osVersion: '11',
      browserVersion: '138.0',
      debug: false,
      // geoLocation: 'IN',
      idleTimeout: 300,
      networkLogs: true,
    },
    timeouts: {
      script: 60000,
      pageLoad: 40000,
      implicit: 5000,
    },
  }],

  // Override cucumber timeout for BrowserStack (slower remote execution)
  cucumberOpts: {
    ...baseConfig.cucumberOpts,
    timeout: 360000,
    format: ['pretty'],
    scenarioLevelReporter: false,
  },
};
// const metaPath = path.join(__dirname, '../../utils/report-meta.json');
// fs.writeFileSync(metaPath, JSON.stringify(reportMeta, null, 2));