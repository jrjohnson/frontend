import {
  clickable,
  create,
  collection,
  count,
  fillable,
  hasClass,
  property,
  text,
  visitable
} from 'ember-cli-page-object';

import selectable from '../helpers/selectable';

export default create({
  scope: '[data-test-instructor-groups]',
  visit: visitable('/instructorgroups'),
  filterByTitle: fillable('[data-test-title-filter]'),
  schoolFilters: collection({
    itemScope: '[data-test-school-filter] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
  toggleNewGroupForm: clickable('[data-test-toggle-new-group-form]'),
  newGroupForm: {
    scope: '[data-test-new-group]',
    title: fillable('[data-test-title]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  newGroupLink: text('[data-test-new-group] a'),
  savedGroupsCount: count('[data-test-new-group] a'),
  visitNewGroup: clickable('[data-test-new-group] a'),
  groups: collection({
    scope: '[data-test-instructor-group-list]',
    itemScope: '[data-test-groups] tr',

    item: {
      title: text('td', { at: 0 }),
      clickTitle: clickable('a', {scope: 'td:eq(0)'}),
      users: text('td', { at: 1 }),
      courses: text('td', { at: 2 }),
      edit: clickable('.edit', {scope: 'td:eq(3)'}),
      remove: clickable('.remove', {scope: 'td:eq(3)'}),
      hasConfirmRemovalClass: hasClass('confirm-removal'),
    },
  }),
  confirmGroupRemoval: clickable('[data-test-groups] .confirm-removal button.remove'),
  cancelGroupRemoval: clickable('[data-test-groups] .confirm-removal button.done'),
  confirmGroupRemovalMessage: text('[data-test-groups] .confirm-message'),
});
