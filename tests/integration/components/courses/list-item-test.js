import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/courses/list-item';

module('Integration | Component | courses/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const course = this.server.create('course', {
      title: 'Test Course',
      level: 2,
      startDate: '2023-04-23',
      endDate: '2023-05-30',
      published: false,
      publishedAsTbd: false,
      locked: false,
    });
    this.permissionCheckerMock = class extends Service {
      async canUpdateCourse() {
        return true;
      }
      async canUnlockCourse() {
        return true;
      }
      async canDeleteCourse() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
    this.course = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.strictEqual(component.title, 'Test Course');
    assert.strictEqual(component.level, '2');
    assert.strictEqual(component.startDate, '04/23/2023');
    assert.strictEqual(component.endDate, '05/30/2023');
    assert.strictEqual(component.status, 'Not Published');
    assert.ok(component.isUnlocked);
    assert.notOk(component.isLocked);
    assert.ok(component.isUnlocked);
    assert.ok(component.isUnlocked);
  });

  test('lock', async function (assert) {
    assert.expect(4);
    this.set('lock', (course) => {
      assert.strictEqual(course, this.course);
    });
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{this.lock}}
      @unlockCourse={{(array)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.ok(component.isUnlocked);
    assert.notOk(component.isLocked);
    assert.ok(component.canLock);
    await component.lock();
  });

  test('unlock', async function (assert) {
    assert.expect(4);
    this.course.locked = true;
    this.set('unlock', (course) => {
      assert.strictEqual(course, this.course);
    });
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{this.unlock}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.notOk(component.isUnlocked);
    assert.ok(component.isLocked);
    assert.ok(component.canUnlock);
    await component.unLock();
  });

  test('confirm removal', async function (assert) {
    assert.expect(2);
    this.set('confirmRemoval', (course) => {
      assert.strictEqual(course, this.course);
    });
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{this.confirmRemoval}}
    />`);
    assert.ok(component.canRemove);
    await component.remove();
  });

  test('cannot unlock', async function (assert) {
    this.permissionCheckerMock.reopen({
      canUnlockCourse() {
        return false;
      },
    });
    this.course.locked = true;
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.ok(component.isLocked);
    assert.notOk(component.canUnlock);
  });

  test('cannot lock', async function (assert) {
    this.permissionCheckerMock.reopen({
      canUpdateCourse() {
        return false;
      },
    });
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.ok(component.isUnlocked);
    assert.notOk(component.canLock);
  });

  test('cannot delete b/c course has been rolled over', async function (assert) {
    const course2 = this.server.create('course');
    const courseModel2 = await this.owner.lookup('service:store').findRecord('course', course2.id);
    this.course.descendants = [courseModel2];
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c course is scheduled', async function (assert) {
    this.course.publishedAsTbd = true;
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.strictEqual(component.status, 'Scheduled');
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c course is published', async function (assert) {
    this.course.published = true;
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.strictEqual(component.status, 'Published');
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c permission denied', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteCourse() {
        return false;
      },
    });
    await render(hbs`<Courses::ListItem
      @course={{this.course}}
      @coursesForRemovalConfirmation={{(array)}}
      @savingCourseIds={{(array)}}
      @lockCourse={{(noop)}}
      @unlockCourse={{(noop)}}
      @confirmRemoval={{(noop)}}
    />`);
    assert.notOk(component.canRemove);
  });
});
