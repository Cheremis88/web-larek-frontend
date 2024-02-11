import {Component} from "./base/Component";
import {TProduct} from "../types";
import {bem, createElement, ensureElement} from "../utils/utils";

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<TProduct> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _category?: HTMLElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(container: HTMLElement, actions: ICardActions) {
        super(container);

        this._title = container.querySelector('.card__title');
        this._price = container.querySelector('.card__price');
        this._image = container.querySelector('.card__image');
        this._description = container.querySelector('.card__text');
        this._category = container.querySelector('.card__category');
        this._button = container.querySelector('.card__button');

        if (this._button) {
            this._button.addEventListener('click', actions.onClick);
        } else {
            container.addEventListener('click', actions.onClick);
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        if (value) {
            this.setText(this._price, value + ' синапсов');
        } else {
            this.setText(this._price, 'Бесценно');
        }
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: string) {
        this.setText(this._category, value);
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }
}

export class CardPreview extends Card {
    constructor(container: HTMLElement, inBasket: boolean, isInvaluable: boolean, actions: ICardActions) {
        super(container, actions);

        if (inBasket) {
            this.setText(this._button, 'Убрать');
        } else {
            this.setText(this._button, 'Купить');
        }

        if (isInvaluable) {
            this.setDisabled(this._button, true);
        }
    }
}

export class CardBasket extends Card {
    protected _index: HTMLElement;
    constructor(container: HTMLElement, index: number, actions: ICardActions) {
        super(container, actions);
        this._index = container.querySelector('.basket__item-index');
        this.setText(this._index, index);
    }
}