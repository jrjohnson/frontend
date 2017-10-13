import {
  clickable,
  create,
  collection,
  fillable,
  text,
  triggerable,
  visitable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-admin-dashboard]',
  visit: visitable('/admin'),
  manageUsers: clickable('[data-test-users-link]'),
  userSearchInput: fillable('[data-test-user-search] input'),
  searchForUsers: triggerable('search', '[data-test-user-search] input'),
  userSearchResults: collection({
    scope: '[data-test-user-search]',
    itemScope: '[data-test-user-search-results] li.user',

    item: {
      name: text('[data-test-user-search-result-name]'),
      email: text('[data-test-user-search-result-email]'),
    },
  }),
});
