import {Api, ApiListResponse} from "./base/Apia";
import {TProduct, TOrder, TOrderResult} from "../types";

export interface IPurchaseApi {
  getProductList(): Promise<TProduct[]>;
  orderProducts(order: TOrder): Promise<TOrderResult>;
}

export class PurchaseApi extends Api implements IPurchaseApi {
  readonly cdn: string;

  constructor(baseUrl: string, cdn: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList() {
    return this.get('/product').then((data: ApiListResponse<TProduct>) =>
        data.items.map(item => ({
          ...item,
          image: this.cdn + item.image
        }))
      );
  }

  orderProducts(order: TOrder): Promise<TOrderResult> {
    return this.post('/order', order).then(
        (data: TOrderResult) => data
    );
  }
}