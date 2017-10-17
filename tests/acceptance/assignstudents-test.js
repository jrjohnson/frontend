import { test } from 'qunit';
import moduleForAcceptance from 'ilios/tests/helpers/module-for-acceptance';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from 'ilios/tests/helpers/destroy-app';
import page from 'ilios/tests/pages/assign-students';


let application;
moduleForAcceptance('Acceptance | assign students', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);

    server.createList('school', 2);

  },
  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /admin/assignstudents', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), '/admin/assignstudents');
  assert.equal(page.selectedSchool, 'school 0');
});
