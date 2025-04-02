import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | InstructorGroup', function (hooks) {
  setupTest(hooks);

  test('list courses', async function (assert) {
    const store = this.owner.lookup('service:store');
    const instructorGroup = store.createRecord('instructor-group');

    const course1 = store.createRecord('course', { title: 'course1' });
    const course2 = store.createRecord('course', { title: 'course2' });
    const course3 = store.createRecord('course', { title: 'course3' });
    const session1 = store.createRecord('session', { course: course1 });
    const session2 = store.createRecord('session', { course: course1 });
    const session3 = store.createRecord('session', { course: course2 });
    const session4 = store.createRecord('session', { course: course3 });

    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session2, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session2, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session3, instructorGroups: [instructorGroup] });
    store.createRecord('ilm-session', { session: session3, instructorGroups: [instructorGroup] });
    store.createRecord('ilm-session', { session: session4, instructorGroups: [instructorGroup] });

    const courses = await waitForResource(instructorGroup, 'courses');
    assert.strictEqual(courses.length, 3);
    assert.ok(courses.includes(course1));
    assert.ok(courses.includes(course2));
    assert.ok(courses.includes(course3));
  });
  test('list sessions', async function (assert) {
    const store = this.owner.lookup('service:store');
    const instructorGroup = store.createRecord('instructor-group');

    const session1 = store.createRecord('session');
    const session2 = store.createRecord('session');
    const session3 = store.createRecord('session');
    const session4 = store.createRecord('session');

    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session1, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session2, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session2, instructorGroups: [instructorGroup] });
    store.createRecord('offering', { session: session3, instructorGroups: [instructorGroup] });
    store.createRecord('ilm-session', { session: session3, instructorGroups: [instructorGroup] });
    store.createRecord('ilm-session', { session: session4, instructorGroups: [instructorGroup] });

    const sessions = await waitForResource(instructorGroup, 'sessions');
    assert.strictEqual(sessions.length, 4);
    assert.ok(sessions.includes(session1));
    assert.ok(sessions.includes(session2));
    assert.ok(sessions.includes(session3));
    assert.ok(sessions.includes(session4));
  });

  test('usersCount', async function (assert) {
    const store = this.owner.lookup('service:store');
    const instructorGroup = store.createRecord('instructor-group');

    assert.strictEqual(instructorGroup.usersCount, 0);
    store.createRecord('user', { instructorGroups: [instructorGroup] });
    store.createRecord('user', { instructorGroups: [instructorGroup] });

    assert.strictEqual(await waitForResource(instructorGroup, 'usersCount'), 2);
  });
});
