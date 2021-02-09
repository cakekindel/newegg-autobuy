const {timer} = require('rxjs');
const RxOp = require('rxjs/operators/index.js');
const axios = require('axios');
const cheerio = require('cheerio');
const PushBullet = require('pushbullet');

// helpers
const throwE = e => {throw e;};
const envOrThrow = key => process.env[key] || throwE(new Error(`env var ${key} not set`));
const isEmpty = len => len.length === 0;
const not = f => (...args) => !f(...args);

/**
 * construct an "item" object.
 * This is the common representation for products across sources.
 */
const purchaseObj = (title, price, url, inStock) => ({title, price, url, inStock});

// newegg stuff
const isAd = $ => (_, el) => $('.txt-ads-box', el).length > 0 ? true : false;
const parseItem = $ => (_, el) => purchaseObj(
                                    $(".item-title", el).text(),
                                    $(".price-current strong", el).text(),
                                    $("a.item-title", el).attr("href"),
                                    $(".item-promo", el).text() !== "OUT OF STOCK",
                                  );

const url = 'https://www.newegg.com/p/pl?d=rtx+3070&N=4020%204021&PageSize=96';
const getNeweggItems = axios.get(url, {responseType: 'text'})
                            .then(({data}) => cheerio.load(data))
                            .then($ => $('.items-grid-view .item-cell')
                                         .filter(not(isAd($)))
                                         .map(parseItem($))
                                         .get()
                            );

// aggregate sources, filter out of stock
const getInStock = () => getNeweggItems()
                           .then(arr => arr.filter(item => item.inStock));

const printItemInfo = item => {
  return `Price: $${item.price}\nItem Name: ${item.title}`;
}

const notifiedItems = []

const sendNotification = item => {
  if(notifiedItems.some(oldItem => oldItem.url === item.url))
    return;
  notifiedItems.push(item);
  const pb = new PushBullet(envOrThrow('PB_API_KEY'));
  const notify = device => pb.link(device.iden, 'Newegg Alert', item.url, printItemInfo(item));

  pb.devices()
    .then(({devices}) => devices)
    .then(devices     => devices.forEach(notify))
}

timer(0, 500)
  .pipe(
    // RxOp.flatMap(getInStock),
    RxOp.map(() => [{title: 'Testing 123', url: 'https://www.cheese.com', price: 419.68}]),
    RxOp.tap(data => {
      if (data.length > 0) {
        data.forEach(sendNotification)
      }
    }),
    RxOp.takeWhile(isEmpty),
  )
  .subscribe({ next: () => console.log("got an event"), complete: () => console.log("ALL DONE!") });
