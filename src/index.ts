import './scss/styles.scss';

import { EventEmitter } from './components/base/EventEmitter';
import { PurchaseApi } from './components/PurchaseApi';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState } from './components/AppState';
import { Page } from './components/Page';
import { Modal } from './components/Modal';
import { Card, CardPreview, ICardActions } from './components/Card';
import { TProduct } from './types';

const events = new EventEmitter();
const api = new PurchaseApi(API_URL, CDN_URL);

const appData = new AppState(events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderPaymentTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderContactsTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

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
  const inBasket = appData.checkProduct();
  const isInvaluable = appData.isInvaluable();

  let callback: ICardActions;

  if (inBasket) {
    callback = {onClick: () => events.emit('basket:delete', item)};
  } else {
    callback = {onClick: () => events.emit('basket:add', item)};
  }

  const preview = new CardPreview(cloneTemplate(cardPreviewTemplate), inBasket, isInvaluable, callback);
  
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


events.on('basket:add', (item: TProduct) => {
  appData.addToBasket(item);
  page.counter = appData.basket.length;
});





api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });