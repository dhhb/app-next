import http from 'http';
import path from 'path';
import logger from 'morgan';
import express from 'express';
import nunjucks from 'nunjucks';
import marked from 'marked';
import compression from 'compression';
import Hashids from 'hashids';
import { host, port, env } from 'c0nfig';
import api from './utils/api';

const hashids = new Hashids();
const app = express();

if ('test' !== env) {
  app.use(logger('dev'));
}

nunjucks.configure(path.join(__dirname, './views'), {
  autoescape: true,
  express: app
});

app.disable('x-powered-by');
app.use(compression());
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (req, res) => {
  api.getArticles({include: ['author', 'category']}).then(articles => {
    articles.forEach(article => {
      article.shortId = hashids.encodeHex(article.id);

      if (article.intro) {
        article.introHTML = marked(article.intro).trim();
      }

      if (article.content) {
        article.contentHTML = marked(article.content).trim();
      }
    });
    res.render('home.html', {
      title: 'r-o-b.media',
      articles
    });
  }).catch(err => {
    console.log(err);
  });
});

app.get('/by-id/:id', (req, res) => {
  api.getArticle(req.params.id, {include: ['author', 'category']}).then(article => {
    if (article.intro) {
      article.introHTML = marked(article.intro).trim();
    }

    if (article.content) {
      article.contentHTML = marked(article.content).trim();
    }

    res.render('article.html', {
      title: 'r-o-b.media',
      article
    });
  }).catch(err => {
    console.log(err);
  });
});

app.get('/:shortId/:slug', (req, res) => {
  const id = hashids.decodeHex(req.params.shortId);

  api.getArticle(id, {include: ['author', 'category']}).then(article => {
    if (article.intro) {
      article.introHTML = marked(article.intro).trim();
    }

    if (article.content) {
      article.contentHTML = marked(article.content).trim();
    }

    res.render('article.html', {
      title: 'r-o-b.media',
      article
    });
  }).catch(err => {
    console.log(err);
  });
});

export function start() {
  http.createServer(app).listen(port, () => {
    console.log(`app server is listening on http://${host}:${port} env=${env}`);
  });
}
