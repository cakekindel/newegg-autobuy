import axios from 'axios';
import cheerio from 'cheerio';

const url = 'https://www.newegg.com/p/pl?d=rtx+3070&N=4020%204021';

axios.get(url, {responseType: 'text'})
     .then(({data}) => cheerio.load(data))
     .then($ => $('.speech-info')[0].text())
     .then(console.log)

