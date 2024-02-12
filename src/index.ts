import './scss/styles.scss';

import { EventEmitter } from './components/base/EventEmitter';
import { PurchaseApi } from './components/PurchaseApi';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState } from './components/AppState';
import { Page } from './components/Page';
import { Modal } from './components/Modal';
import { Card, CardBasket, CardPreview, ICardActions } from './components/Card';
import { TOrder, TOrderCommon, TOrderContacts, TOrderPayment, TOrderResult, TProduct } from './types';
import { Basket } from './components/Basket';
import { Form, Payment } from './components/Order';
import { Success } from './components/Success';

const events = new EventEmitter();
const api = new PurchaseApi(API_URL, CDN_URL);

const appData = new AppState(events);

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderPaymentTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Form<TOrderContacts>(cloneTemplate(orderContactsTemplate), events);
const payment = new Payment(cloneTemplate(orderPaymentTemplate), events);

events.on('catalog:changed', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new Card(cloneTemplate(cardTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category
    });
  });
});

events.on('card:select', (item: TProduct) => {
  appData.setPreview(item);
});

events.on('preview:changed', (item: TProduct) => {
  const inBasket = appData.isPurchased(item);
  const isInvaluable = appData.isInvaluable();

  const preview = new CardPreview(cloneTemplate(cardPreviewTemplate),
     inBasket, isInvaluable, {onClick: () => events.emit('basket:changed', item)});
  
  modal.render({
    content: preview.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category,
      description: item.description
    })
  });
});

events.on('basket:changed', (item: TProduct) => {
  if (appData.isPurchased(item)) {
    appData.deleteFromBasket(item);
  } else {
    appData.addToBasket(item);
  }

  basket.items = appData.basket.map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), index + 1,
        {onClick: () => events.emit('basket:changed', item)});
    return card.render({
      title: item.title,
      price: item.price,
    });
  });
  
  basket.total = appData.totalPrice;

  if (appData.preview.id) {
    events.emit('preview:changed', item);
  }

  page.counter = appData.basket.length;
});

events.on('basket:open', () => {
  modal.render({
    content: basket.render()
  });
})

events.on('order:open', () => {
  
  appData.formOrder();

  modal.render({
    content: payment.render({
      valid: false,
      selected: ''
    })
  });
});

events.on('order:changed', (data: {field: keyof TOrderCommon, value: string}) => {
  appData.order[data.field] = data.value;
  payment.valid = !!appData.order.payment && !!appData.order.address;
  order.valid = !!appData.order.email && !!appData.order.phone;
});

events.on('payment:submit', () => {
  modal.render({
    content: order.render({
      valid: false
    })
  });
});

events.on('order:submit', () => {
  api.orderProducts(appData.order)
  .then(data => events.emit('order:success', data))
  .catch(err => console.log(err));
})

events.on('order:success', (data: TOrderResult) => {
  appData.basket = [];
  page.counter = 0;
  basket.items = [];
  basket.total = 0;
  const success = new Success(cloneTemplate(successTemplate), () => modal.close());
  modal.render({
    content: success.render({total: data.total})
  });
});

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
  appData.preview = {};
});

api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });