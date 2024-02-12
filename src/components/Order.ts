import { TOrderPayment } from "../types";
import { ensureAllElements, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/EventEmitter";

interface IFormState {
    valid: boolean;
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onOrderChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onOrderChange(field: keyof T, value: string) {
        this.events.emit(`order:changed`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    } 
}

export interface IPayment {
    selected: string;
}

export class Payment extends Form<TOrderPayment> {
    protected _buttons: HTMLButtonElement[];

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container, events);
        this._buttons = ensureAllElements<HTMLButtonElement>('button[type=button]', container);
        this._buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.onOrderChange('payment', button.name);
                this.selected = button.name;
            });
        });
    }

    set selected(name: string) {
        this._buttons.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === name);
        });
    }

    render(data: IFormState & IPayment) {
        const {valid, ...selected} = data;
        super.render({valid});
        Object.assign(this, selected);
        return this.container;
    }
}