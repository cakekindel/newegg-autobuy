import axios from 'axios';
import cheerio from 'cheerio';

const purchaseObj = (title, price, url, inStock) => ({title, price, url, inStock});

const sendNotification = (data) => {
     let filteredList = data.filter(e => e.inStock);
     console.log(filteredList);
}

const url = 'https://www.newegg.com/p/pl?d=rtx+3070&N=4020%204021&PageSize=96';
//TODO traverse pages
axios.get(url, {responseType: 'text'})
     .then(({data}) => cheerio.load(data))
     .then($ => $('.items-grid-view .item-cell')
                  .map((_, el) => purchaseObj(
                                   $(".item-title", el).text(),
                                   $(".price-current strong", el).text(),
                                   $("a.item-title", el).attr("href"),
                                   $(".item-promo", el).text() !== "OUT OF STOCK"))
                  .get()
     )
     .then(sendNotification)
