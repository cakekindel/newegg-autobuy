import {timer} from 'rxjs';
import * as RxOp from 'rxjs/operators/index.js';
import axios from 'axios';
import cheerio from 'cheerio';

const purchaseObj = (title, price, url, inStock) => ({title, price, url, inStock});

const sendNotification = (data) => {
     let filteredList = data.filter(e => e.inStock);
     console.log(filteredList);
}

const isEmpty = len => len.length === 0;
const not = f => (...args) => !f(...args);
const isAd = $ => (_, el) => $('.txt-ads-box', el).length > 0 ? true : false;
const parseItem = $ => (_, el) => purchaseObj(
                                    $(".item-title", el).text(),
                                    $(".price-current strong", el).text(),
                                    $("a.item-title", el).attr("href"),
                                    $(".item-promo", el).text() !== "OUT OF STOCK",
                                  );

const url = 'https://www.newegg.com/p/pl?d=rtx+3070&N=4020%204021&PageSize=96';

const getInStock = () => axios.get(url, {responseType: 'text'})
                              .then(({data}) => cheerio.load(data))
                              .then($ => $('.items-grid-view .item-cell')
                                           .filter(not(isAd($)))
                                           .map(parseItem($))
                                           .get()
                              )
                              .then(arr => arr.filter(item => item.inStock))
                              .then(arr => {
                                console.log(arr);
                                return arr;
                              });

timer(0, 500)
  .pipe(
    RxOp.flatMap(getInStock),
    RxOp.takeWhile(isEmpty),
  )
  .subscribe();
