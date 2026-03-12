#!/usr/bin/env node
const path = require('path');
const newman = require('newman');
const fs = require('fs');

const collectionFile = process.argv[2] || 'reqres-api.json';
const collectionPath = path.join(__dirname, 'collection', collectionFile);
const envPath = path.join(__dirname, 'collection', 'env.json');
const reportsDir = path.join(__dirname, 'reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const htmlReportPath = path.join(reportsDir, `newman-report-${timestamp}.html`);
const jsonReportPath = path.join(reportsDir, `newman-report-${timestamp}.json`);

newman.run({
  collection: collectionPath,
  environment: envPath,
  reporters: ['cli', 'htmlextra', 'json'],
  reporter: {
    htmlextra: {
      export: htmlReportPath
    },
    json: {
      export: jsonReportPath
    }
  }
}, (err, summary) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('\nReports saved to:', reportsDir);
  process.exit(summary.run.failures.length > 0 ? 1 : 0);
});
