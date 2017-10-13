import {
  create,
  text,
  visitable
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-user]',
  visit: visitable('/user/:id'),
  name: text('[data-test-name]'),
});
