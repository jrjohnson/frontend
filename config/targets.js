'use strict';

const browsers = ['last 1 Chrome versions', 'last 1 Firefox versions', 'last 1 Safari versions'];

const isCI = Boolean(process.env.CI);
const isProductionLikeBuild = ['production', 'preview'].includes(process.env.EMBER_ENV);

if (isCI || isProductionLikeBuild) {
  browsers.push('last 1 edge versions');
  browsers.push('firefox esr'); //sometimes points to the last 2 ESR releases when they overlap
  browsers.push('last 4 ios versions');
  browsers.push('last 3 safari versions');
}

module.exports = {
  browsers,
};
