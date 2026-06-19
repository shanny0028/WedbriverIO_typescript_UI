import { config as baseConfig } from './wdio.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  // =====================
  // BrowserStack Settings
  // =====================
  user: 'shantanukakade_O36w1n',
  key: 'zAk3QQaq23CBkj4ptSin',

  services: ['browserstack'],
  hostname: 'hub.browserstack.com',
  port: 443,
  path: '/wd/hub',

  // Keep one remote session unless you intentionally scale up mobile parallelism.
  maxInstances: 1,
  waitforTimeout: 80000,
  connectionRetryTimeout: 360000,
  outputDir: './reports',

  capabilities: [
    {
      browserName: 'chrome',
      'bstack:options': {
        deviceName: 'Samsung Galaxy S23',
        osVersion: '13.0',
        sessionName: 'Mobile Web Regression - Android Chrome',
        debug: false,
        idleTimeout: 300,
        networkLogs: true,
      },
      timeouts: {
        script: 60000,
        pageLoad: 40000,
        implicit: 5000,
      },
    },
    {
      browserName: 'safari',
      'bstack:options': {
        deviceName: 'iPhone 14',
        osVersion: '16',
        realMobile: 'true',
        sessionName: 'Mobile Web Regression - iOS Safari',
        debug: false,
        idleTimeout: 300,
        networkLogs: true,
      },
      timeouts: {
        script: 60000,
        pageLoad: 40000,
        implicit: 5000,
      },
    },
  ],

  cucumberOpts: {
    ...baseConfig.cucumberOpts,
    timeout: 360000,
    format: ['pretty'],
    scenarioLevelReporter: false,
  },
};
