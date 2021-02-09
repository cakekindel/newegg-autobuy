import axios from 'axios';
import cheerio from 'cheerio';

const purchaseObj = (title, price, inStock) => ({title, price, inStock});

const url = 'https://www.newegg.com/p/pl?d=rtx+3070&N=4020%204021&PageSize=96';

axios.get(url, {responseType: 'text'})
     .then(({data}) => cheerio.load(data))
     .then($ => $('.items-grid-view .item-cell')
                  .map((_, el) => $(el).text())
                  .get()
     )
     .then(console.log)
