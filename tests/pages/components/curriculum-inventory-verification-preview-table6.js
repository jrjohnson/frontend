import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-verification-preview-table6]',
  title: text('[data-test-title]'),
  table: {
    scope: 'table',
    firstHeadings: collection('thead tr:eq(0) th'),
    secondHeadings: collection('thead tr:eq(1) th'),
    rows: collection('tbody tr', {
      cells: collection('td'),
    }),
  },
};

export default definition;
export const component = create(definition);
