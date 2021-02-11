import Component from '@glimmer/component';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserMenuComponent extends Component {
  @service intl;
  @service currentUser;
  @tracked isOpen = false;
  @tracked element;

  @action
  toggleMenu() {
    if (this.isOpen) {
      this.isOpen = false;
    } else {
      this.openMenuAndSelectTheFirstItem();
    }
  }

  openMenuAndSelectTheFirstItem() {
    this.isOpen = true;
    schedule('afterRender', () => {
      this.element.querySelector('.menu li:nth-of-type(1) a').focus();
    });
  }

  @action
  keyDown(evt) {
    const button = evt.target.tagName.toLowerCase() === 'button' ? evt.target : null;
    let item;
    if (!button) {
      item = evt.target.tagName.toLowerCase() === 'li' ? evt.target : evt.target.parentElement;
    }

    switch (evt.key) {
      case 'ArrowDown':
        if (evt.target.tagName.toLowerCase() === 'button') {
          this.openMenuAndSelectTheFirstItem();
        } else {
          if (item.nextElementSibling) {
            item.nextElementSibling.querySelector('a').focus();
          } else {
            schedule('afterRender', () => {
              this.element.querySelector('.menu li:nth-of-type(1) a').focus();
            });
          }
        }
        break;
      case 'ArrowUp':
        if (item.previousElementSibling) {
          item.previousElementSibling.querySelector('a').focus();
        } else {
          this.element.querySelector('.menu li:last-of-type a').focus();
        }
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }

    return true;
  }
}
