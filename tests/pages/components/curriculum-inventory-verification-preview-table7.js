import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-verification-preview-table7]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    headings: collection('thead tr th'),
    rows: collection('tbody tr', {
      id: text('td', { at: 0 }),
      title: text('td', { at: 1 }),
      numSummative: text('td', { at: 2 }),
      numFormative: text('td', { at: 3 }),
    }),
    footer: collection('tfoot tr td'),
  },
};

export default definition;
export const component = create(definition);
