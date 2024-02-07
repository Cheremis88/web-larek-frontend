import {Api, ApiListResponse} from "./base/Api";
import {TProduct, TOrder, TOrderResult} from "../types";

interface IPurchaseApi {
  getLotList(): Promise<TProduct[]>
  orderLots(order: TOrder): Promise<TOrderResult>
}