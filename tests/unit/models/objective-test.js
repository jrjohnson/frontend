import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Objective', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('objective');
    assert.ok(!!model);
  });

  test('active defaults to true', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('objective');
    assert.ok(!!model);
    assert.ok(model.active);
  });

  test('top parent with no parents should be self', async function(assert) {
    assert.expect(2);

    const model = this.owner.lookup('service:store').createRecord('objective');
    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), model);
  });

  test('current top parents with single parent tree', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [parent1]
    });

    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), parent2);
  });

  test('current top parents with multi parent tree', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [model]
    });
    const parent3 = store.createRecord('objective', {
      children: [parent1]
    });
    const parent4 = store.createRecord('objective', {
      children: [parent2]
    });

    const topParents = await model.get('topParents');
    assert.ok(topParents.length === 2);
    assert.ok(topParents.includes(parent3));
    assert.ok(topParents.includes(parent4));
  });

  test('tree competencies', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');

    const parent1 = store.createRecord('objective', {
      children: [model]
    });
    const parent2 = store.createRecord('objective', {
      children: [model]
    });
    const parent3 = store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [parent1],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency2
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency1
    });

    const treeCompetencies = await model.get('treeCompetencies');
    assert.equal(2, treeCompetencies.length);
    assert.ok(treeCompetencies.includes(competency1));
    assert.ok(treeCompetencies.includes(competency2));
  });


  test('removeParentWithProgramYears', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = this.owner.lookup('service:store').createRecord('objective');
    model.reopen({
      async save() {
        assert.ok(true, 'save() was called.');
      }
    });
    const programYear1 = store.createRecord('programYear');
    const parentObjective1 = store.createRecord('objective', { programYears: [ programYear1 ] });
    const programYear2 = store.createRecord('programYear');
    const parentObjective2 = store.createRecord('objective', { programYears: [ programYear2 ] });
    const programYear3 = store.createRecord('programYear');
    const parentObjective3 = store.createRecord('objective', { programYears: [ programYear3 ] });

    model.get('parents').pushObjects([parentObjective1, parentObjective2, parentObjective3 ]);

    await model.removeParentWithProgramYears([programYear1, programYear2]);
    const parents = await model.get('parents');
    assert.equal(parents.length, 1);
    assert.ok(parents.includes(parentObjective3));
  });
});
