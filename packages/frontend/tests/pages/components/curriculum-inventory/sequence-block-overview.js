import {
  collection,
  clickable,
  create,
  fillable,
  hasClass,
  isVisible,
  property,
  text,
  triggerable,
  value,
  isPresent,
} from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';
import sessionManager from './sequence-block-session-manager';
import sessionList from './sequence-block-session-list';
import yesNoToggle from 'ilios-common/page-objects/components/toggle-yesno';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-overview]',
  title: text('[data-test-overview] [data-test-title]'),
  course: {
    scope: '[data-test-overview] [data-test-course]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    details: text('[data-test-course-details]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  courseDetails: {
    scope: '[data-test-overview] [data-test-course-details]',
  },
  description: {
    scope: '[data-test-overview] [data-test-description]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    set: fillable('textarea'),
    value: text('textarea'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  required: {
    scope: '[data-test-overview] [data-test-required]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  startLevel: {
    scope: '[data-test-overview] [data-test-starting-academic-level]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    level: text('[data-test-edit]'),
  },
  endLevel: {
    scope: '[data-test-overview] [data-test-ending-academic-level]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    level: text('[data-test-edit]'),
  },
  track: {
    scope: '[data-test-overview] [data-test-track]',
    label: text('label'),
    isEditable: isVisible('[data-test-toggle-yesno]'),
    yesNoToggle,
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  startDate: {
    scope: '[data-test-overview] [data-test-start-date]',
    edit: clickable('[data-test-edit]'),
    isEditable: isVisible('[data-test-edit]'),
  },
  endDate: {
    scope: '[data-test-overview] [data-test-end-date]',
    edit: clickable('[data-test-edit]'),
    isEditable: isVisible('[data-test-edit]'),
  },
  duration: {
    scope: '[data-test-overview] [data-test-duration]',
    edit: clickable('[data-test-edit]'),
    isEditable: isVisible('[data-test-edit]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  orderInSequence: {
    scope: '[data-test-overview] [data-test-order-in-sequence]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  childSequenceOrder: {
    scope: '[data-test-overview] [data-test-child-sequence-order]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  isSelective: {
    scope: '[data-test-overview] [data-test-is-selective]',
    isHidden: hasClass('hidden'),
  },
  minimum: {
    scope: '[data-test-overview] [data-test-minimum]',
    edit: clickable('[data-test-edit]'),
    isEditable: isVisible('[data-test-edit]'),
  },
  maximum: {
    scope: '[data-test-overview] [data-test-maximum]',
    edit: clickable('[data-test-edit]'),
    isEditable: isVisible('[data-test-edit]'),
  },
  sessions: {
    scope: '[data-test-overview] [data-test-session-list-controls]',
    label: text('label'),
    editButton: {
      scope: 'button',
    },
  },
  minMaxEditor: {
    scope: '[data-test-curriculum-inventory-sequence-block-min-max-editor]',
    minimum: {
      scope: '[data-test-minimum]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      isDisabled: property('disabled', 'input'),
      hasErrors: isPresent('[data-test-minimum-validation-error-message]'),
      error: text('[data-test-minimum-validation-error-message]'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    maximum: {
      scope: '[data-test-maximum]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      hasErrors: isPresent('[data-test-maximum-validation-error-message]'),
      error: text('[data-test-maximum-validation-error-message]'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
  durationEditor: {
    scope:
      '[data-test-overview] [data-test-curriculum-inventory-sequence-block-dates-duration-editor]',
    duration: {
      scope: '[data-test-duration]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      hasErrors: isPresent('[data-test-duration-validation-error-message]'),
      error: text('[data-test-duration-validation-error-message]'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    startDate: {
      scope: '[data-test-startdate]',
      label: text('label'),
      value: value('input'),
      set: flatpickrDatePicker('input'),
      hasErrors: isPresent('[data-test-start-date-validation-error-message]'),
      error: text('[data-test-start-date-validation-error-message]'),
    },
    endDate: {
      scope: '[data-test-enddate]',
      label: text('label'),
      value: value('input'),
      set: flatpickrDatePicker('input'),
      hasErrors: isPresent('[data-test-end-date-validation-error-message]'),
      error: text('[data-test-end-date-validation-error-message]'),
    },
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
  sessionList,
  sessionManager,
};

export default definition;
export const component = create(definition);
