export type TProduct = {
  id: string,
  description: string,
  image: string,
  title: string,
  category: string,
  price: number | null,
}

export type TOrderPayment = {
  payment: string,
  address: string,
}

export type TOrderContacts = {
  email: string,
  phone: string,
}

export type TOrderCommon = TOrderPayment & TOrderContacts;

export type TOrder = TOrderCommon & {total: number, items: string[]};

export type TOrderResult = {
  id: string,
  total: number,
}

export interface IAppState {
  catalog: TProduct[] | [];
  basket: Partial<TProduct>[];
  preview: Partial<TProduct>;
  order: TOrder;
}