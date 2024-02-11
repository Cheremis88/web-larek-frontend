import {IAppState, TProduct, TOrder} from "../types";
import { EventEmitter, IEvents } from "./base/EventEmitter";

export class AppState implements IAppState {
  catalog: TProduct[] = [];
  basket: Partial<TProduct>[] = [];
  preview: Partial<TProduct> = {};
  order: TOrder = {
    payment: 'online',
    address: '',
    email: '',
    phone: '',
    total: 0,
    items: [],
  }
  
  constructor(protected _events: IEvents) {}

  get totalPrice(): number {
    return
  }
  
  setCatalog(products: TProduct[]) {
    this.catalog = products;
    this._events.emit('catalog:changed');
  }

  setPreview(product: TProduct) {
    this.preview = product;
    this._events.emit('preview:changed', product);
  }

  addToBasket(product: Partial<TProduct>): void {
    this.basket.push(product);
    this._events.emit('preview:changed', product);
  }

  deleteFromBasket(product: Partial<TProduct>): void {

  }

  checkProduct(): boolean {
    return this.basket.some(product => product === this.preview);
  }
  
  isInvaluable(): boolean {
    return !this.preview.price;
  }
}