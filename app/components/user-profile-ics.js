import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

export default class UserProfileIcsComponent extends Component {
  @service iliosConfig;
  @tracked showCopySuccessMessage = false;

  get icsFeedKey() {
    return this.args.user.icsFeedKey;
  }

  get host() {
    return this.iliosConfig.apiHost;
  }

  get icsFeedUrl() {
    if (this.icsFeedKey) {
      let host = this.host;
      if (!host) {
        host = window.location.protocol + '//' + window.location.hostname;
        const port = window.location.port;

        if (![80, 443].includes(port)) {
          host += ':' + port;
        }
      }
      return host + '/ics/' + this.icsFeedKey;
    }

    return null;
  }

  /**
   * Generate a random token from a combination of
   * the user id, a random string and the current time
   * Implementation lifted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
   * @param String userId
   * @return String
   */
  async randomToken(userId) {
    const now = Date.now();
    const randomValue = Math.random().toString(36).substr(2);
    const msgUint8 = new TextEncoder().encode(userId + randomValue + now); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  }

  @dropTask
  *refreshKey() {
    const token = yield this.randomToken(this.args.user.id);
    this.args.user.set('icsFeedKey', token);
    yield this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    yield timeout(500);
    this.hasSavedRecently = false;
  }

  @restartableTask
  *textCopied() {
    this.showCopySuccessMessage = true;
    yield timeout(3000);
    this.showCopySuccessMessage = false;
  }
}
