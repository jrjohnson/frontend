import {
  create,
  clickable,
  collection,
  hasClass,
  isPresent,
  notHasClass,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-manage-objective-competency]',
  domains: collection('.parent-picker [data-test-domain]', {
    title: text('.domain-title'),
    selected: hasClass('selected'),
    notSelected: notHasClass('selected'),
    toggle: clickable('input'),
    competencies: collection('ul li', {
      title: text(),
      selected: hasClass('selected', 'label'),
      notSelected: notHasClass('selected', 'label'),
      toggle: clickable('input'),
    }),
  }),
  hasNoCompetenciesMessage: isPresent('[data-test-no-competencies-message]'),
};

export default definition;
export const component = create(definition);
