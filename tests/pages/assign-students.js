import {
  collection,
  create,
  property,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-assign-students]',
  visit: visitable('/admin/assignstudents'),
  selectedSchool: text('[data-test-selected-school]'),
  schoolFilters: collection({
    itemScope: '[data-test-school-filter] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
});
