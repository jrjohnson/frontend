'use strict';

const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

const isCI = !!process.env.CI;
const isProductionLikeBuild = ['production', 'preview'].includes(process.env.EMBER_ENV);

if (isCI || isProductionLikeBuild) {
  browsers.push('last 1 edge versions');
  browsers.push('firefox esr'); //actually points to the last 2 ESR releases as they overlap
  browsers.push('last 1 ios versions');
}
console.log('Is CI:', isCI);
console.log('isProductionLikeBuild:', isProductionLikeBuild);
console.log('Building for:', browsers);

module.exports = {
  browsers
};
