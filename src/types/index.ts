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


/* get product: {total: 10, items: [{}, {}]}

   post order:
        payment: 'online',
        email: 'jkkj@kkk',
        phone: '+794444',
        address: 'sdfsfs',
        total: 2200,
        items: ['c101ab44-ed99-4a54-990d-47aa2bb4e7d9',
                '854cef69-976d-4c2a-a18c-2aa45046c390'] 

return for order: {id: 'id session', total: summa zakaza}


fetch('https://larek-api.nomoreparties.co/api/weblarek/product', {
    'Content-Type': 'application/json'})
.then(res => res.json())
.then(res => console.log(res.items))


fetch('https://larek-api.nomoreparties.co/api/weblarek/order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        payment: 'online',
        email: 'jkkj@kkk',
        phone: '+794444',
        address: 'sdfsfs',
        total: 2200,
        items: ['c101ab44-ed99-4a54-990d-47aa2bb4e7d9',
                '854cef69-976d-4c2a-a18c-2aa45046c390']
    })
})
.then(res => res.json())
.then(res => console.log(res))
*/
