import { createElement, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { EventEmitter } from "./base/EventEmitter";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLElement;

  constructor(container: HTMLElement, protected events: EventEmitter) {
      super(container);

      this._list = ensureElement<HTMLElement>('.basket__list', this.container);
      this._total = this.container.querySelector('.basket__price');
      this._button = this.container.querySelector('.basket__button');

      if (this._button) {
          this._button.addEventListener('click', () => {
              events.emit('order:open');
          });
      }

      this.items = [];
      this.total = 0;
  }

  set items(items: HTMLElement[]) {
      if (items.length) {
          this._list.replaceChildren(...items);
      } else {
          this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
              textContent: 'Корзина пуста, чья в этом вина?'
          }));
      }
  }

  set total(total: number) {
      if (!total) {
        this.setText(this._total, 'Оформлять нечего :(');
        this.setDisabled(this._button, true);
      } else {
        this.setText(this._total, total + ' синапсов');
        this.setDisabled(this._button, false);
      }
  }
}