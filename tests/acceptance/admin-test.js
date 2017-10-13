import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import page from 'ilios/tests/pages/admin';
import userPage from 'ilios/tests/pages/user';

let application;

module('Acceptance: Admin', {
  beforeEach() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach() {
    destroyApp(application);
  }
});

test('visiting /admin', async function(assert) {
  await page.visit();
  assert.equal(currentPath(), 'admin-dashboard');
});

test('can transition to `users` route', async function (assert) {
  await page.visit();
  await page.manageUsers();

  assert.equal(currentURL(), '/users', 'transition occurred');
});

test('can search for users', async function(assert) {
  server.createList('user', 20, { email: 'user@example.edu' });
  server.createList('authentication', 20);

  await page.visit();
  await page.userSearchInput('son');
  await page.searchForUsers();

  assert.equal(page.userSearchResults().count, 21);
  assert.equal(page.userSearchResults(1).name, '1 guy M. Mc1son', 'user name is correct');
  assert.equal(page.userSearchResults(1).email, 'user@example.edu', 'user email is correct');

  await page.userSearchResults(1).click();
  assert.equal(currentURL(), '/users/2', 'new user profile is shown');
  assert.equal(userPage.name, '1 guy M. Mc1son', 'user name is shown');


  await page.visit();
  await page.userSearchInput('son');
  await page.searchForUsers();

  assert.equal(page.userSearchResults().count, 21);
  assert.equal(page.userSearchResults(2).name, '2 guy M. Mc2son', 'user name is correct');
  assert.equal(page.userSearchResults(2).email, 'user@example.edu', 'user email is correct');

  await page.userSearchResults(2).click();
  assert.equal(currentURL(), '/users/3', 'new user profile is shown');
  assert.equal(userPage.name, '2 guy M. Mc2son', 'user name is shown');
});
