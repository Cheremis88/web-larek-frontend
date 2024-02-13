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
Методы класса `AppState` с их кратким описанием:
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

Свойство `_content` хранит DOM-элемент, содержимое которого будет заменяться:
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

### class Basket extends Component\<IBasket\>

**Отвечает за отображение товаров в корзине и кнопки "Оформить"**

Стандартный конструктор. В свойстве `_list` лежит контейнер списка товаров, содержимое которого может меняться:
```ts
protected _list: HTMLElement;
protected _total: HTMLElement;
protected _button: HTMLElement;

constructor(container: HTMLElement, protected events: EventEmitter)
```
Методы (сеттеры) соответствуют интерфейсу `IBasket`:
```ts
set items(items: HTMLElement[]); // заменяет содержимое списка товаров
set total(total: number); // отображает общую стоимость и в зависимости от значения меняет активность кнопки
```

### class Form\<T\> extends Component\<IFormState\>

**Работает с базовой формой заказа (поля ввода и кнопка), является родителем класса Payment**

Свойство `_submit` хранит элемент кнопки, в конструкторе элементу формы задаются слушатели событий `input` и `submit`:
```ts
protected _submit: HTMLButtonElement;
constructor(protected container: HTMLFormElement, protected events: IEvents);
```
Без нужных методов никуда:
```ts
protected onOrderChange(field: keyof T, value: string); // отдает эмиттеру данные от слушателей
set valid(value: boolean); // меняет активность кнопки в зависимости от заполненных полей
```

### class Payment extends Form\<TOrderPayment\>

**Расширяет класс Form для удобной работы с кнопками способа оплаты**

Поле `_buttons` хранит массив кнопок, найденных в конструкторе:
```ts
protected _buttons: HTMLButtonElement[];
constructor(protected container: HTMLFormElement, protected events: IEvents);
```
Сеттер, переключающий стили кнопок в зависимости от того, какая нажата:
```ts
set selected(name: string); // принимает имя кнопки
``` 

### class Success extends Component\<ISuccess\>

**Класс для отображения информации об успешной покупке**

В конструкторе вешаем на кнопку слушатель с колбэком закрытия модального окна:
```ts
protected _message: HTMLElement;
protected _button: HTMLButtonElement;

constructor(container: HTMLElement, onClose: () => void);
```
Сеттер из интерфейса `ISuccess` добавляет сумму покупки в текст сообщения:
```ts
set total(value: number);
```

## Коммуникация

### class PurchaseApi extends Api implements IPurchaseApi

**Создан для удобной связи с сервером, расширяет базовый класс Api**

В конструкторе принимает и записывает часть пути `cdn` для получения контента:
```ts
readonly cdn: string;
constructor(baseUrl: string, cdn: string, options?: RequestInit)
```
Имплементирует интерфейс с методами, которые являются обертками базовых, типизируют получаемые и отправляемые данные, вставляют нужные эндпоинты:
```ts
interface IPurchaseApi {
  getProductList(): Promise<TProduct[]>; // также добавляет к ссылке каждой картинки объекта путь до контента
  orderProducts(order: TOrder): Promise<TOrderResult>;
}
```

## Основные события

В проекте предусмотрены следующие события:

- `catalog:changed`: отрисовка карточек товаров из каталога на главной странице;
- `card:select`: запись данных о выбранном товаре;
- `preview:changed`: проверка товара на бесценность и наличие его в корзине, рендер и открытие модального окна с превью;
- `basket:changed`: в зависимости от условий добавляет или удаляет товар из массива корзины, рендерит новый список товаров и их общую стоимость в корзине, изменяет счетчик корзины на главной странице и текст кнопки в превью;
- `basket:open`: открытие модального окна с рендером готовой корзины;
- `order:open`: добавление в данные о заказе полей с суммой и массивом id, рендер первой формы в модальном окне;
- `order:changed`: запись введенных данных в поля заказа, проверка заполнения для смены активности кнопки;
- `payment:submit`: рендер второй формы заказа;
- `order:submit`: отправка данных заказа на сервер через post-запрос;
- `order:success`: очистка данных, счетчика и отображения корзины, рендер окна с сообщением об успешной покупке;
- `modal:open`: блокировка скролла главной страницы;
- `modal:close`: снятие блокировки, очистка данных о превью.

## Что можно улучшить

1. Поправить верстку и размеры модальных окон, изменить размер изображения в превью.
2. Сделать полную валидацию форм с сообщениями об ошибках.
3. Добавить прелоадер при отправке запросов.
4. Сообщать об ошибке в случае неудачной покупки.
5. Сделать виртуальный счет с энной суммой денег.