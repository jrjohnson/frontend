import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learnergroup-user-manager]',
  filter: fillable('[data-test-filter]'),
  title: text('[data-test-title]'),
  groupMembers: text('[data-test-group-members]'),
  allOtherMembers: text('[data-test-all-other-members]'),
  selectAll: {
    scope: '[data-test-headers] th:eq(0) input',
    toggle: clickable(),
    isChecked: property('checked'),
    isIndeterminate: property('indeterminate'),
  },
  usersInCurrentGroup: collection('[data-test-users-in-current-group] tr', {
    isSelected: property('checked', 'td:eq(0) input'),
    canBeSelected: isPresent('td:eq(0) input'),
    select: clickable('td:eq(0) input'),
    name: {
      scope: 'td:eq(1)',
      userNameInfo,
    },
    campusId: text('td', { at: 2 }),
    isDisabled: isPresent('td:nth-of-type(1) [data-test-is-disabled]'),
    email: text('td', { at: 3 }),
    remove: clickable('.no.clickable'),
    canBeRemoved: isPresent('.no.clickable'),
  }),
  usersNotInCurrentGroup: collection('[data-test-users-not-in-current-group] tr', {
    isSelected: property('checked', 'td:eq(0) input'),
    canBeSelected: isPresent('td:eq(0) input'),
    select: clickable('td:eq(0) input'),
    name: {
      scope: 'td:eq(1)',
      userNameInfo,
    },
    campusId: text('td', { at: 2 }),
    isDisabled: isPresent('td:nth-of-type(1) [data-test-is-disabled]'),
    email: text('td', { at: 3 }),
    add: clickable('.yes.clickable'),
    canBeAdded: isPresent('.yes.clickable'),
  }),
  add: clickable('button.done'),
  addButtonText: text('button.done'),
  remove: clickable('button.cancel'),
  removeButtonText: text('button.cancel'),
  membersCanBeAdded: isPresent('button.done'),
  membersCanBeRemoved: isPresent('button.cancel'),
};

export default definition;
export const component = create(definition);
