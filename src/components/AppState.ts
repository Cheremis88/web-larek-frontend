import {IAppState, TProduct, TOrder} from "../types";
import { EventEmitter, IEvents } from "./base/EventEmitter";

class AppState implements IAppState {
  protected _events: IEvents;
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
  
  get totalPrice(): number {
    return
  }
  
  setCatalog(products: TProduct[]) {

  }

  setPreview(product: TProduct) {

  }

  addToBasket(product: Partial<TProduct>): void {

  }

  deleteFromBasket(product: Partial<TProduct>): void {

  }

  checkProduct(): boolean {
    return
  }
  
  isInvaluable(): boolean {
    return
  }
}