import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60,
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['form'],

  fillModeSupported: false,
  fillWithCohort: false,
  isSaving: false,
  title: null,

  actions: {
    save() {
      this.send('addErrorDisplayFor', 'title');
      this.validate()
        .then(({ validations }) => {
          this.set('isSaving', true);
          if (validations.get('isValid')) {
            const title = this.title;
            const fillWithCohort = this.fillWithCohort;
            return this.save(title, fillWithCohort);
          }
        })
        .finally(() => {
          this.set('isSaving', false);
        });
    },
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('save');
      return;
    }

    if (27 === keyCode) {
      this.cancel();
    }
  },
});
