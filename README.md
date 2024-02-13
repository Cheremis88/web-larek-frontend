# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## О проекте

"Веб-ларёк" - это виртуальный магазин уникальных товаров. Пользователь может посмотреть каталог на главной странице, прочитать описание выбранного товара и купить его в одном экземпляре. Бесценные товары приобрести нельзя - только любоваться. Перед оформлением заказа можно увидеть в корзине его общую стоимость и, если жалко виртуальных денег, - удалить любые позиции. Выбираем способ оплаты, вводим адрес, телефон и почту - и виртуальные товары в вашем виртуальном кармане!

## Архитектура проекта

"Веб-ларёк" построен на упрощённой модели MVP с применением событийно-ориентированного подхода: слой данных отделён от слоя отображения, а их связь организуется с помощью брокера событий `EventEmitter`. Через `index.ts` в экземпляр брокера императивно передаются названия основных событий и функции, срабатывающие при их наступлении.

## Базовые классы

Надёжные товарищи, предоставляющие базовый функционал: **Api, Component, EventEmitter.**

### class Api
**Обеспечивает взаимодействие приложения с сервером.**

Свойства хранят базовую ссылку для запросов к серверу и дополнительные опции:
```typescript
readonly baseUrl: string;
protected options: RequestInit;
constructor(baseUrl: string, options: RequestInit = {})
```
Методы получают и отправляют данные, подставляя нужные эндпоинты и параметры:
```typescript
protected handleResponse(response: Response): Promise<object>;
get(uri: string);
post(uri: string, data: object, method: ApiPostMethods = 'POST');
```

### abstract class Component\<T\>
**Содержит основные методы для работы с DOM-элементами дочерних компонентов. Через дженерик принимает интерфейс класса-наследника, типизирующий данные при рендере.**

Единственное свойство хранит контейнер дочернего компонента:
```typescript
protected constructor(protected readonly container: HTMLElement);
```
Методы позволяют переключать класс, менять текст и изображение, скрывать и показывать элемент, менять активность кнопки и, конечно, рендерить весь компонент, наполняя его новыми данными и возвращая готовый контейнер:
```typescript
protected setText(element: HTMLElement, value: unknown);
protected setHidden(element: HTMLElement);
protected setVisible(element: HTMLElement);
protected setImage(element: HTMLImageElement, src: string, alt?: string);
setDisabled(element: HTMLElement, state: boolean);
toggleClass(element: HTMLElement, className: string, force?: boolean);
render(data?: Partial<T>): HTMLElement;
```

### class EventEmitter implements IEvents
**Является инструментом создания, хранения и запуска событий.**

В конструкторе создает свойство и записывает в него `Map` для хранения названий событий и их уникальных колбэков:
```typescript
protected _events: Map<EventName, Set<Subscriber>>;
```
Имплементирует интерфейс с базовыми методами: подписка на событие, запуск события и создание колбэка с запуском события:
```typescript
interface IEvents {
  on<T extends object>(event: EventName, callback: (data: T) => void): void;
  emit<T extends object>(event: string, data?: T): void;
  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```
Функционал класса также позволяет подписаться сразу на все события, отписаться от конкретного события и очистить всю карту событий:
```typescript
onAll(callback: (event: EmitterEvent) => void);
off(eventName: EventName, callback: Subscriber);
offAll();
```

## Слой данных

Приложение работает с данными, полученными от сервера либо непосредственно от пользователя. Первым делом через get-запрос загружается каталог товаров, каждый из которых представляет собой объект:
```ts
type TProduct = {
  id: string,
  description: string,
  image: string,
  title: string,
  category: string,
  price: number | null,
}
```
Оформление заказа происходит в два шага: в первой форме пользователь выбирает способ оплаты и указывает адрес проживания, во второй - электронную почту и номер телефона:
```ts
type TOrderPayment = {
  payment: 'online' | 'offline',
  address: string,
}

type TOrderContacts = {
  email: string,
  phone: string,
}
```
Через их пересечение создается общий тип введенных данных `TOrderCommon`. Прицепляем к нему общую сумму заказа и массив id купленных товаров - и получаем тип данных для корректного post-запроса `TOrder`. Если операция прошла успешно, в ответ приходит объект с id сессии и подтвержденной суммой покупки:
```ts
type TOrder = TOrderCommon & {total: number, items: string[]};

type TOrderResult = {
  id: string,
  total: number,
}
```

### class AppState

Работа с указанными данными возложена на класс `AppState`. Его поля хранят данные о полученных с сервера товарах, о добавленных в корзину, об открытой карточке и о полях заказа:
```ts
interface IAppState {
  catalog: TProduct[] | [];
  basket: Partial<TProduct>[];
  preview: Partial<TProduct>;
  order: TOrder;
}
```
Через конструктор принимается экземпляр класса `EventEmitter` для управления событиями при изменении данных:
```ts
constructor(protected _events: IEvents) {}
```
А вот и методы класса `AppState`:
```ts
get totalPrice(): number; // считает общую стоимость товаров в корзине
setCatalog(products: TProduct[]); // записывает данные обо всех товарах
setPreview(product: TProduct); // записывает данные о товаре, карточка которого открыта
addToBasket(product: Partial<TProduct>): void; // добавляет товар в корзину
deleteFromBasket(product: Partial<TProduct>): void; // удаляет товар из корзины
isPurchased(product: TProduct): boolean; // проверяет, лежит ли товар в корзине
isInvaluable(): boolean; // проверяет, является ли товар бесценным
formOrder(): void; // добавляет нужные данные к заказу
```

## Слой отображения

Реализуется с помощью нескольких классов, описывающих отдельные компоненты приложения.

### class Page extends Component\<IPage\>

**Отвечает за отрисовку карточек и счетчика корзины на главной странице**

Свойства хранят нужные DOM-элементы, конструктор принимает контейнер `body` и экземпляр `EventEmitter`:
```ts
protected _counter: HTMLElement;
protected _catalog: HTMLElement;
protected _wrapper: HTMLElement;
protected _basket: HTMLElement;

constructor(container: HTMLElement, protected events: IEvents);
```
Методы (сеттеры) соответствуют интерфейсу `IPage`:
```ts
set counter(value: number); // устанавливает нужное число на иконке корзины
set catalog(items: HTMLElement[]); // рендерит карточки товаров из каталога
set locked(value: boolean); // ставит и снимает блокировку прокрутки при открытии модального окна
```

### class Modal extends Component\<IModalData\>

**Рендерит внутри себя контент других компонентов**

Свойство `_content` содержит DOM-элемент, содержимое которого будет заменяться:
```ts
protected _closeButton: HTMLButtonElement;
protected _content: HTMLElement;
constructor(container: HTMLElement, protected events: IEvents)
```
Методы позволяют открывать и закрывать модалку, а также менять контент внутри:
```ts
set content(value: HTMLElement); // заменяет дочерние DOM-элементы
open();
close();
render(data: IModalData); // перезаписывает содержимое через сеттер content
```

### class Card extends Component\<TProduct\>

**Работает с базовым типом карточки товара (на главной странице), является родителем классов CardPreview и CardBasket**

Помимо общего контейнера, конструктор принимает колбэки для слушателей. Обошлись без `EventEmitter`:
```ts
protected _title: HTMLElement;
protected _price: HTMLElement;
protected _image?: HTMLImageElement;
protected _category?: HTMLElement;
protected _description?: HTMLElement;
protected _button?: HTMLButtonElement;

constructor(container: HTMLElement, actions: ICardActions);
```
Методы меняют текст или изображение в элементах полей с помощью родительских `setText` и `setImage`:
```ts
set title(value: string);
set price(value: number | null);
set image(value: string);
set category(value: string);
set description(value: string | string[]);
```

### class CardPreview extends Card implements ICardPreview

**Карточка с описанием товара и кнопкой "Купить"/"Убрать"**

Конструктор принимает параметры `inBasket` и `isInvaluable`, в зависимости от значений которых меняется текст и активность кнопки:
```ts
constructor(container: HTMLElement, inBasket: boolean, isInvaluable: boolean, actions: ICardActions);
```
Методы, непосредственно меняющие текст и активность кнопки:
```ts
setButtonText(result: boolean);
setButtonState(result: boolean);
```

### class CardBasket extends Card

**Мини-карточка товара в корзине с кнопкой удаления и порядковым номером**

Через конструктор добавляется элемент с порядковым номером товара в корзине. Отдельных методов нет.
```ts
protected _index: HTMLElement;
constructor(container: HTMLElement, index: number, actions: ICardActions)
```


### Слой связи (презентер)

Берёт на себя функции по организации сообщения между двумя другими слоями. В проекте применяется событийно-ориентированный подход, поэтому для связи данных и отображения используется функционал брокера событий (`EventEmitter`). Через `index.ts` в инстанс брокера (events) императивно передаются названия возможных событий и функции, срабатывающие при их наступлении. При этом сам events передаётся в конструктор многих классов проекта, что позволяет обращаться к нему из их экземпляров.

Возможные события и краткое описание последствий:

- `page:load`: отрисовка каталога товаров и счётчика корзины;
- `card:select`: рендер превью товара, запись его объекта в AppState, проверка на бесценность и наличие его в корзине, открытие модального окна, блокировка скролла страницы;
- `product:add`: добавление товара в корзину, текст кнопки в превью меняется на "Убрать", счетчик корзины увеличивается;
- `product:delete`: удаление товара из корзины, пересчет общей стоимости корзины, счетчик корзины уменьшается;
- `basket:open`: рендер корзины, подсчет стоимости, открытие модального окна, блокировка скролла страницы;
- `order:step1`: рендер контента с выбором метода оплаты и полем ввода адреса;
- `order:step2`: запись данных из первого шага в AppState, замена контента в модальном окне;
- `order:send`: запись данных заказа в AppState, отправка запроса с этими данными на сервер;
- `order:success`: вывод сообщения в модальном окне, очистка корзины;
- `modal:close`: закрытие модального окна.

### API

Связь приложения с сервером происходит с помощью базовых методов класса `Api`: get и post. Его расширяет класс `PurchaseApi`, типизирующий получаемые и отправляемые данные, вставляющий базовые адреса и эндпоинты, а также корректирующий ссылки картинок в получаемых объектах.