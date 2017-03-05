import http from 'http';
import path from 'path';
import logger from 'morgan';
import express from 'express';
import nunjucks from 'nunjucks';
import compression from 'compression';
import { host, port, env } from 'c0nfig';

const app = express();

if ('test' !== env) {
  app.use(logger('dev'));
}

nunjucks.configure(path.join(__dirname, './views'), {
  autoescape: true,
  cache: false,
  express: app
});

app.disable('x-powered-by');
app.use(compression());

app.get('/', (req, res) => {
  res.render('index.html', {
    title: 'r-o-b.media'
  });
});

export function start() {
  http.createServer(app).listen(port, () => {
    console.log(`app server is listening on http://${host}:${port} env=${env}`);
  });
}
