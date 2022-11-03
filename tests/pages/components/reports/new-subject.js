import { clickable, create, collection, fillable, property, text } from 'ember-cli-page-object';
import manager from 'ilios-common/page-objects/components/mesh-manager';
import search from 'ilios-common/page-objects/components/user-search';

const definition = {
  scope: '[data-test-reports-new-subject]',
  componentTitle: text('[data-test-component-title]'),
  title: {
    label: text('label'),
    scope: '[data-test-title]',
    set: fillable('input'),
    errors: collection('.validation-error-message'),
  },
  schools: {
    label: text('label'),
    scope: '[data-test-school]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  subjects: {
    label: text('label'),
    scope: '[data-test-subject]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  objects: {
    label: text('label'),
    scope: '[data-test-object]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
    errors: collection('.validation-error-message'),
  },
  academicYears: {
    scope: '[data-test-report-academic-years]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  selectedInstructor: {
    scope: '[data-test-selected-instructor]',
    remove: clickable('button'),
  },
  instructors: {
    scope: '[data-test-instructors]',
    search,
    errors: collection('.validation-error-message'),
  },
  selectedMeshTerm: {
    scope: '[data-test-selected-mesh-term]',
    name: text('[data-test-name]'),
    details: text('[data-test-details]'),
    remove: clickable('button'),
  },
  mesh: {
    scope: '[data-test-mesh]',
    manager,
    errors: collection('.validation-error-message'),
  },
  prepositionalObjects: {
    scope: '[data-test-prepositional-objects]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  cancel: clickable('[data-test-cancel]'),
  save: clickable('[data-test-save]'),
};

export default definition;
export const component = create(definition);