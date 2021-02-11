import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { map } from 'rsvp';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class VisualizerSessionTypeVocabulariesComponent extends Component {
  @service router;
  @tracked tooltipContent;
  @tracked tooltipTitle;
  @tracked data = [];

  @restartableTask
  *load(element, [sessionType]) {
    const sessions = (yield sessionType.sessions).toArray();
    const terms = yield map(sessions, async (session) => {
      const sessionTerms = (await session.terms).toArray();
      const course = await session.course;
      const courseTerms = (await course.terms).toArray();

      return [...sessionTerms, ...courseTerms];
    });

    const termsWithVocabularies = yield map(terms.flat(), async (term) => {
      const vocabulary = await term.vocabulary;
      return { term, vocabulary };
    });

    const vocabularyObjects = termsWithVocabularies.reduce((vocabularies, { vocabulary }) => {
      const id = vocabulary.id;
      if (!(id in vocabularies)) {
        vocabularies[id] = {
          data: 0,
          meta: { vocabulary },
        };
      }
      vocabularies[id].data++;
      return vocabularies;
    }, {});

    const vocabularyData = Object.values(vocabularyObjects);
    const totalTerms = vocabularyData.mapBy('data').reduce((total, count) => total + count, 0);
    this.data = vocabularyData.map((obj) => {
      const percent = ((obj.data / totalTerms) * 100).toFixed(1);
      obj.label = `${percent}%`;

      return obj;
    });
  }

  get vocabulariesWithLinkedTerms() {
    return this.data.filter((obj) => obj.data !== 0);
  }

  @action
  donutClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }

    this.router.transitionTo(
      'session-type-visualize-terms',
      this.args.sessionType.id,
      obj.meta.vocabulary.id
    );
  }

  getTooltipData(obj) {
    if (this.args.isIcon || !obj || obj.empty) {
      return '';
    }
    const { meta } = obj;

    const vocabularyTitle = meta.vocabulary.title;
    const title = htmlSafe(vocabularyTitle);

    return {
      title,
      content: title,
    };
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    const data = yield this.getTooltipData(obj);
    if (data) {
      this.tooltipTitle = data.title;
      this.tooltipContent = data.content;
    }
  }
}
