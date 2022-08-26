const FailureOnlyPerBrowserReporter = require('testem-failure-only-reporter/grouped-by-browser');

const BrowserStackLaunchers = {
  BS_OSX_Safari: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'OS X',
      '--osv',
      'Catalina',
      '--b',
      'safari',
      '--bv',
      'latest', // Will always be 13.x on Catalina
      '-t',
      '1200',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
  BS_MS_Edge: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'Windows',
      '--osv',
      '10',
      '--b',
      'edge',
      '--bv',
      '93',
      '-t',
      '1200',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
  BS_MS_Chrome: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'Windows',
      '--osv',
      '11',
      '--b',
      'Chrome',
      '--bv',
      '92',
      '-t',
      '1200',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
  BS_IOS_SAFARI: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: ['--os', 'ios', '--osv', '13', '--b', 'iPhone 8', '-t', '1200', '--u', '<url>'],
    protocol: 'browser',
  },
};

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  timeout: 1200,
  reporter: FailureOnlyPerBrowserReporter,
  browser_start_timeout: 2000,
  browser_disconnect_timeout: 120,
  parallel: 4,
  disable_watching: true,
  launchers: BrowserStackLaunchers,
  launch_in_dev: [],
  launch_in_ci: Object.keys(BrowserStackLaunchers),
};
