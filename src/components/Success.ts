import { Component } from "./base/Component";

interface ISuccess {
  total: number;
}

export class Success extends Component<ISuccess> {
  protected _message: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, onClose: () => void) {
    super(container);
    this._message = container.querySelector('.order-success__description');
    this._button = container.querySelector('.order-success__close');
    this._button.addEventListener('click', onClose);
  }

  set total(value: number) {
    this.setText(this._message, `Списано ${value} синапсов`);
  }
}