import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import page from 'ilios/tests/pages/instructorgroups';


var application;

module('Acceptance: Instructor Groups', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /instructorgroups', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  await page.visit();
  assert.equal(currentPath(), 'instructorGroups');
});

test('list groups', async function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1,2]
  });
  var firstInstructorGroup = server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  var secondInstructorGroup = server.create('instructorGroup', {
    school: 1
  });
  assert.expect(7);
  await page.visit();

  assert.equal(2, page.groups().count);

  assert.equal(page.groups(0).title, firstInstructorGroup.title);
  assert.equal(page.groups(0).users, 5);
  assert.equal(page.groups(0).courses, 2);

  assert.equal(page.groups(1).title, secondInstructorGroup.title);
  assert.equal(page.groups(1).users, 0);
  assert.equal(page.groups(1).courses, 0);
});

test('filters by title', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1,2,3]
  });
  let firstInstructorGroup = server.create('instructorGroup', {
    title: 'specialfirstinstructorgroup',
    school: 1,
  });
  let secondInstructorGroup = server.create('instructorGroup', {
    title: 'specialsecondinstructorgroup',
    school: 1
  });
  let regularInstructorGroup = server.create('instructorGroup', {
    title: 'regularinstructorgroup',
    school: 1
  });
  let regexInstructorGroup = server.create('instructorGroup', {
    title: '\\yoo hoo',
    school: 1
  });
  assert.expect(19);

  await page.visit();

  assert.equal(page.groups().count, 4);

  assert.equal(page.groups(0).title, regexInstructorGroup.title);
  assert.equal(page.groups(1).title, regularInstructorGroup.title);
  assert.equal(page.groups(2).title, firstInstructorGroup.title);
  assert.equal(page.groups(3).title, secondInstructorGroup.title);

  await page.filterByTitle('first');
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, firstInstructorGroup.title);

  await page.filterByTitle('second');
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, secondInstructorGroup.title);

  await page.filterByTitle('special');
  assert.equal(page.groups().count, 2);
  assert.equal(page.groups(0).title, firstInstructorGroup.title);
  assert.equal(page.groups(1).title, secondInstructorGroup.title);

  await page.filterByTitle('\\');
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, regexInstructorGroup.title);

  await page.filterByTitle('');
  assert.equal(page.groups().count, 4);
  assert.equal(page.groups(0).title, regexInstructorGroup.title);
  assert.equal(page.groups(1).title, regularInstructorGroup.title);
  assert.equal(page.groups(2).title, firstInstructorGroup.title);
  assert.equal(page.groups(3).title, secondInstructorGroup.title);
});

test('filters options', async function(assert) {
  assert.expect(5);
  server.create('user', {id: 4136, permissions: [1], school: 2});
  server.createList('school', 2);
  server.create('permission', {
    tableName: 'school',
    tableRowId: 1,
    user: 4136
  });

  await page.visit();

  assert.equal(page.schoolFilters().count, 2);
  assert.equal(page.schoolFilters(0).text, 'school 0');
  assert.notOk(page.schoolFilters(0).selected);
  assert.equal(page.schoolFilters(1).text, 'school 1');
  assert.ok(page.schoolFilters(1).selected);
});

test('add new instructorgroup', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  assert.expect(4);

  await page.visit();
  await page.toggleNewGroupForm();
  await page.newGroupForm.title('Instructor Group 1');
  await page.newGroupForm.save();

  assert.equal(page.savedGroupsCount, 1);
  assert.equal(page.groups().count, 1);
  assert.equal(page.newGroupLink, 'Instructor Group 1');
  assert.equal(page.groups(0).title, 'Instructor Group 1', 'group title is correct');
});

test('cancel adding new instructor group', async function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });

  await page.visit();
  assert.equal(page.savedGroupsCount, 0);
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');

  await page.toggleNewGroupForm();
  await page.newGroupForm.title('Instructor Group 1');
  await page.newGroupForm.cancel();

  assert.equal(page.savedGroupsCount, 0);
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');
});

test('remove instructor group', async function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });

  await page.visit();
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');
  await page.groups(0).remove();
  await page.confirmGroupRemoval();

  assert.equal(page.groups().count, 0);
});

test('cancel remove instructor group', async function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });

  await page.visit();
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');
  await page.groups(0).remove();
  await page.cancelGroupRemoval();

  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');
});

test('confirmation of remove message', async function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  assert.expect(4);

  await page.visit();
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'instructor group 0');
  await page.groups(0).remove();
  assert.ok(page.groups(0).hasConfirmRemovalClass);
  assert.equal(page.confirmGroupRemovalMessage, 'Are you sure you want to delete this instructor group, with 5 instructors and 2 courses? This action cannot be undone. Yes Cancel');
});

test('click edit takes you to instructor group route', async function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await page.visit();
  await page.groups(0).edit();
  assert.equal(currentURL(), '/instructorgroups/1');
});

test('click title takes you to instructor group route', async function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await page.visit();
  await page.groups(0).clickTitle();
  assert.equal(currentURL(), '/instructorgroups/1');
});

test('title filter escapes regex', async function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    title: 'yes\\no',
    school: 1,
  });

  await page.visit();

  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'yes\\no');

  await page.filterByTitle('\\');
  assert.equal(page.groups().count, 1);
  assert.equal(page.groups(0).title, 'yes\\no');
});
