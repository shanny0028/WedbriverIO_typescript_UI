// reporter.js (or wherever you run the reporter)
const reporter = require('cucumber-html-reporter');

const options = {
  theme: "hierarchy",
  name: 'Savings Weekly Regression Test Report',
  jsonDir: "./reports/json",
  output: "./reports/cucumber_report.html",
  screenshotsDirectory:"./src/reports/json",
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  columnLayout: 2
};


reporter.generate(options);

// reporter.generate({
//   jsonDir: "./reports/chrome-json",
//   output: "./reports/chrome-report.html"
// })

// reporter.generate({
//   jsonDir: "./reports/firefox-json",
//   output: "./reports/firefox-report.html"
// })