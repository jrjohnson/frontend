import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/new/course';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/new/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.server.create('academicYear', { id: 2022 });
    this.server.create('academicYear', { id: 2015 });
    const [school1, school2] = this.server.createList('school', 2);
    this.server.createList('course', 2, { school: school1, year: 2015 });
    this.server.createList('course', 3, { school: school2, year: 2022 });
  });

  test('it renders', async function (assert) {
    assert.expect(12);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    await component.input('course');
    await component.search();

    assert.strictEqual(component.results.length, 5);

    assert.strictEqual(component.results[0].text, '2015 course 0');
    assert.notOk(component.results[0].isSelected);

    assert.strictEqual(component.results[1].text, '2015 course 1');
    assert.notOk(component.results[1].isSelected);
    assert.strictEqual(component.results[2].text, '2022 course 2');
    assert.notOk(component.results[2].isSelected);
    assert.strictEqual(component.results[3].text, '2022 course 3');
    assert.notOk(component.results[3].isSelected);
    assert.strictEqual(component.results[4].text, '2022 course 4');
    assert.notOk(component.results[4].isSelected);

    this.set('currentId', '3');
    assert.ok(component.results[2].isSelected);
  });

  test('it works', async function (assert) {
    assert.expect(3);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '1');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    await component.input('course');
    await component.search();
    assert.strictEqual(component.results.length, 5);

    this.set('changeId', (id) => {
      assert.strictEqual(id, '3');
      this.set('currentId', id);
    });

    await component.results[2].click();
    assert.ok(component.results[2].isSelected);
  });

  test('it filters by school', async function (assert) {
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', 2);
    this.set('school', schoolModel);
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{this.school}}
     />`);

    await component.input('course');
    await component.search();

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].text, '2022 course 2');
    assert.strictEqual(component.results[1].text, '2022 course 3');
    assert.strictEqual(component.results[2].text, '2022 course 4');
  });

  test('it sorts', async function (assert) {
    assert.expect(6);
    this.server.db.courses.update(1, { title: 'xx', externalId: 'course1' });
    this.server.db.courses.update(3, { title: 'aa', externalId: 'course2' });
    await render(hbs`<Reports::Subject::New::Course
      @currentId={{null}}
      @changeId={{(noop)}}
      @school={{null}}
     />`);

    await component.input('course');
    await component.search();
    assert.strictEqual(component.results.length, 5);

    assert.strictEqual(component.results[0].text, '2015 course 1');
    assert.strictEqual(component.results[1].text, '2015 [course1] xx');
    assert.strictEqual(component.results[2].text, '2022 [course2] aa');
    assert.strictEqual(component.results[3].text, '2022 course 3');
    assert.strictEqual(component.results[4].text, '2022 course 4');
  });
});
