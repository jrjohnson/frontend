import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { OfferingTimeBlock } from 'ilios-common/utils/offering-date-block';
import { component } from 'ilios-common/page-objects/components/session-offerings-time-block-offerings';

module('Integration | Component | session-offerings-time-block-offerings', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.owner.lookup('service:intl').setLocale('en-us');
    const key = '2023005134520240120430'; // value doesn't really matter, although it needs to be parseable
    const offeringTimeBlock = new OfferingTimeBlock(key);
    const course = store.createRecord('course');
    const session = store.createRecord('session', { course });
    const offering1 = store.createRecord('offering', { session });
    const offering2 = store.createRecord('offering', { session });
    offeringTimeBlock.addOffering(offering1);
    offeringTimeBlock.addOffering(offering2);
    this.set('offeringTimeBlock', offeringTimeBlock);
    await render(hbs`<SessionOfferingsTimeBlockOfferings
      @offeringTimeBlock={{this.offeringTimeBlock}}
      @removeOffering={{(noop)}}
      @editable={{true}}
    />
`);
    assert.strictEqual(component.offerings.length, 2);
  });

  test('removeOffering triggers', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const key = '2023005134520240120430'; // value doesn't really matter, although it needs to be parseable
    const offeringTimeBlock = new OfferingTimeBlock(key);
    const course = store.createRecord('course');
    const session = store.createRecord('session', { course });
    const offering = store.createRecord('offering', { session });
    offeringTimeBlock.addOffering(offering);
    this.set('offeringTimeBlock', offeringTimeBlock);
    this.set('removeOffering', (o) => {
      assert.strictEqual(offering, o);
    });
    await render(hbs`<SessionOfferingsTimeBlockOfferings
      @offeringTimeBlock={{this.offeringTimeBlock}}
      @removeOffering={{this.removeOffering}}
      @editable={{true}}
    />
`);
    assert.strictEqual(component.offerings.length, 1);
    await component.offerings[0].remove();
    await component.offerings[0].confirmRemoval();
  });
});
