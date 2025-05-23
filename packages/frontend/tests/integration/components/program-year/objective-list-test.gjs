import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program-year/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import ObjectiveList from 'frontend/components/program-year/objective-list';

module('Integration | Component | program-year/objective-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { vocabulary, active: true });
    const term2 = this.server.create('term', { vocabulary });
    this.server.create('program-year-objective', {
      programYear,
      title: 'Objective A',
      position: 0,
      terms: [term1],
    });
    this.server.create('program-year-objective', {
      programYear,
      title: 'Objective B',
      position: 0,
      terms: [term2],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      <template><ObjectiveList @editable={{true}} @programYear={{this.programYear}} /></template>,
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.strictEqual(component.headers[0].text, 'Description');
    assert.strictEqual(component.headers[1].text, 'Competency');
    assert.strictEqual(component.headers[2].text, 'Vocabulary Terms');
    assert.strictEqual(component.headers[3].text, 'MeSH Terms');
    assert.strictEqual(component.headers[4].text, 'Actions');

    assert.strictEqual(component.objectives.length, 2);
    assert.strictEqual(component.objectives[0].description.text, 'Objective B');
    assert.strictEqual(
      component.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)',
    );
    assert.strictEqual(
      component.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 1 (inactive)',
    );
    assert.strictEqual(component.objectives[1].description.text, 'Objective A');
    assert.strictEqual(
      component.objectives[1].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)',
    );
    assert.strictEqual(component.objectives[1].selectedTerms.list[0].terms[0].name, 'term 0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      <template><ObjectiveList @editable={{true}} @programYear={{this.programYear}} /></template>,
    );
    assert.notOk(component.sortIsVisible);
    assert.strictEqual(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.server.create('program-year-objective', { programYear, position: 0 });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      <template><ObjectiveList @editable={{true}} @programYear={{this.programYear}} /></template>,
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.strictEqual(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('all eligible domain trees are shown in competency picker', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const domain1 = this.server.create('competency', { school });
    const competency1 = this.server.create('competency', { school, parent: domain1 });
    const domain2 = this.server.create('competency', { school });
    this.server.createList('competency', 2, { school, parent: domain2 });
    const programYear = this.server.create('program-year', {
      program,
      competencies: [competency1, domain2],
    });
    this.server.create('program-year-objective', { programYear });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      <template><ObjectiveList @editable={{true}} @programYear={{this.programYear}} /></template>,
    );
    await component.objectives[0].competency.manage();
    assert.strictEqual(component.objectives[0].competencyManager.domains.length, 2);
    assert.notOk(component.objectives[0].competencyManager.domains[0].isSelectable);
    assert.strictEqual(component.objectives[0].competencyManager.domains[0].competencies.length, 1);
    assert.strictEqual(component.objectives[0].competencyManager.domains[1].competencies.length, 0);
    assert.ok(component.objectives[0].competencyManager.domains[1].isSelectable);
  });
});
