/* eslint-env node */
/* global require, module */
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  'parallel': 5,
  "launch_in_ci": [
    "Firefox"
  ],
  "launch_in_dev": [
    "Firefox"
  ]
};
